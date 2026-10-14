class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        // HTTP status code, e.g. 200 (OK) or 201 (Created).
        this.statusCode = statusCode;
        // Actual data we want to send to the client.
        this.data = data;
        // Response message; defaults to "Success" if not provided.
        this.message = message;
        // True for status codes below 400; false for 400 and above.
        this.success = statusCode < 400;
    }
}

export { ApiResponse };