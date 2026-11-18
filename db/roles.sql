-- One-time bootstrap by a database administrator. Passwords are supplied at run time and are
-- never committed:
--   psql "$ADMIN_URL" -v migrator_pw="'...'" -v app_pw="'...'" -f db/roles.sql
-- Then create the database owned by diyalo_migrator and run `pnpm db:migrate`.
CREATE ROLE diyalo_migrator LOGIN PASSWORD :migrator_pw;
CREATE ROLE diyalo_app LOGIN PASSWORD :app_pw NOSUPERUSER NOCREATEDB NOCREATEROLE;
