class ApiError extends Error {

    // Constructor runs automatically when a new ApiError object is created
    constructor(
        statusCode, 
        message = "something went wrong",

        // Array to store detailed error information
        errors = [],
        stack = "" 
    ) {

        // Calls parent Error class constructor
        // This sets up the error message properly
        super(message)
        this.errors = errors
        this.statusCode = statusCode
        this.data = null

        // Indicates API request failed
        this.success = false

        // Stores error message
        this.message = message

        // If custom stack trace is provided
        if (stack) {
            this.stack = stack
        } else {

            // Automatically generate clean stack trace
            // 'this' -> current object
            // 'this.constructor' removes constructor call from stack trace
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
export { ApiError }