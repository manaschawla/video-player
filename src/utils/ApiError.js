class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message); // Initialize the built-in Error with the message.

        this.statusCode = statusCode; // HTTP status code, e.g. 400 or 500.
        this.data = null;             // No response data when an error occurs.
        this.message = message;       // Store the error message.
        this.success = false;         // Indicates that the operation failed.
        this.errors = errors;         // Store additional error details.

        if (stack) {
            this.stack = stack; // Use the provided stack trace, if available.
        } else {
            // Capture the stack trace for this error instance.
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };