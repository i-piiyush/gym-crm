export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = "INTERNAL_ERROR", statusCode: number = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access.") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden operation.") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found.") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class CapacityLimitError extends AppError {
  constructor(message: string = "Gym has reached its 50-member customer capacity limit.") {
    super(message, "CAPACITY_LIMIT_REACHED", 400);
    this.name = "CapacityLimitError";
  }
}

