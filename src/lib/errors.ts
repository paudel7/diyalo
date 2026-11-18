/** Typed application errors. Messages are safe to show; they never contain secrets or personal data. */
export class AppError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
export class UnauthenticatedError extends AppError {
  constructor(message = "Sign in required.") {
    super(message, "unauthenticated", 401);
  }
}
export class ForbiddenError extends AppError {
  constructor(
    readonly permission: string,
    message = "You do not have permission to do this.",
  ) {
    super(message, "forbidden", 403);
  }
}
export class ValidationError extends AppError {
  constructor(message = "The request is not valid.") {
    super(message, "validation", 400);
  }
}
export class NotFoundError extends AppError {
  constructor(message = "Not found.") {
    super(message, "not_found", 404);
  }
}
export class ConflictError extends AppError {
  constructor(message = "This change conflicts with the current state.") {
    super(message, "conflict", 409);
  }
}
export class RateLimitedError extends AppError {
  constructor(message = "Too many attempts. Try again later.") {
    super(message, "rate_limited", 429);
  }
}
export class StepUpRequiredError extends AppError {
  constructor(message = "Confirm your authenticator code again to continue.") {
    super(message, "step_up_required", 403);
  }
}
