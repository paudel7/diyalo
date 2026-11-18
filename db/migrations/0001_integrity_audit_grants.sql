-- Hand-written: constraints Drizzle cannot express, audit protections and least-privilege grants.

-- Self references on users and applications.
ALTER TABLE "users" ADD CONSTRAINT "users_deactivated_by_fk" FOREIGN KEY ("deactivated_by") REFERENCES "users"("id") ON DELETE RESTRICT;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_updated_by_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT;
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_duplicate_of_fk" FOREIGN KEY ("duplicate_of_id") REFERENCES "applications"("id") ON DELETE RESTRICT;
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_not_self_duplicate" CHECK ("duplicate_of_id" is null or "duplicate_of_id" <> "id");
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_fk" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;
--> statement-breakpoint

-- Separation of duties: the approver of a case cannot be the application's assignee.
CREATE FUNCTION diyalo_cases_separation() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE assignee uuid;
BEGIN
  IF NEW.approved_by IS NOT NULL THEN
    SELECT assigned_to INTO assignee FROM applications WHERE id = NEW.application_id;
    IF assignee IS NOT NULL AND assignee = NEW.approved_by THEN
      RAISE EXCEPTION 'separation of duties: approver cannot be the assigned case manager' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER cases_separation BEFORE INSERT OR UPDATE ON "cases" FOR EACH ROW EXECUTE FUNCTION diyalo_cases_separation();
--> statement-breakpoint

-- Append-only tables: audit_logs and application_status_history.
CREATE FUNCTION diyalo_reject_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION '% is append-only (% rejected)', TG_TABLE_NAME, TG_OP USING ERRCODE = '42501';
END $$;
--> statement-breakpoint
CREATE TRIGGER audit_logs_no_update BEFORE UPDATE OR DELETE ON "audit_logs" FOR EACH ROW EXECUTE FUNCTION diyalo_reject_mutation();
--> statement-breakpoint
CREATE TRIGGER audit_logs_no_truncate BEFORE TRUNCATE ON "audit_logs" FOR EACH STATEMENT EXECUTE FUNCTION diyalo_reject_mutation();
--> statement-breakpoint
CREATE TRIGGER status_history_no_update BEFORE UPDATE OR DELETE ON "application_status_history" FOR EACH ROW EXECUTE FUNCTION diyalo_reject_mutation();
--> statement-breakpoint
CREATE TRIGGER status_history_no_truncate BEFORE TRUNCATE ON "application_status_history" FOR EACH STATEMENT EXECUTE FUNCTION diyalo_reject_mutation();
--> statement-breakpoint

-- Hash chain continuity: a new audit row must reference the hash of the latest row.
-- The HMAC itself is computed by the application (the key never enters the database).
CREATE FUNCTION diyalo_audit_chain() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE last_hash text;
BEGIN
  PERFORM pg_advisory_xact_lock(727001);
  SELECT row_hash INTO last_hash FROM audit_logs ORDER BY id DESC LIMIT 1;
  IF last_hash IS DISTINCT FROM NEW.prev_hash THEN
    RAISE EXCEPTION 'audit chain broken: prev_hash does not match the latest row' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER audit_logs_chain BEFORE INSERT ON "audit_logs" FOR EACH ROW EXECUTE FUNCTION diyalo_audit_chain();
--> statement-breakpoint

-- Least privilege for the application role (created outside migrations, see db/roles.sql).
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'diyalo_app') THEN
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO diyalo_app', current_database());
    GRANT USAGE ON SCHEMA public TO diyalo_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO diyalo_app;
    REVOKE UPDATE, DELETE, TRUNCATE ON "audit_logs", "application_status_history" FROM diyalo_app;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO diyalo_app;
  END IF;
END $$;
