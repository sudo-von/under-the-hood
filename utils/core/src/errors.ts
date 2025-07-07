/**
 * Base error class for all application-related exceptions.
 * Can be extended to create consistent, domain-specific error types throughout the application.
 */
export class CoreError extends Error {
  /**
   * @param message - The error message.
   */
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a method is intentionally not implemented yet.
 * Useful for abstract base classes, stubs, or unfinished features.
 */
export class MethodNotImplementedYetError extends CoreError {
  /**
   * @param method - The name of the method that is not implemented.
   */
  constructor(method: string) {
    super(`Method '${method}' not implemented yet.`);
  }
}

/**
 * Error thrown when a service fails to start or initialize.
 * This can represent failures due to missing dependencies, misconfigurations,
 * or other issues that prevent the service from starting properly.
 */
export class ServiceInitializationError extends CoreError {
  /**
   * @param service - The name of the service that failed to initialize.
   * @param reason - A descriptive reason for the failure.
   */
  constructor(service: string, reason: string) {
    super(`Failed to initialize the service '${service}'. Reason: ${reason}`);
  }
}
