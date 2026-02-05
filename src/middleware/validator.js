const { z } = require("zod");

/**
 * Schema definitions for API endpoints
 */
const schemas = {
    // Schema for /api/ask endpoint
    askQuestion: z.object({
        question: z
            .string({
                required_error: "Question is required",
                invalid_type_error: "Question must be a string"
            })
            .min(3, "Question must be at least 3 characters")
            .max(1000, "Question must not exceed 1000 characters")
            .trim()
    })
};

/**
 * Validation error class
 */
class ValidationError extends Error {
    constructor(errors) {
        super("Validation failed");
        this.name = "ValidationError";
        this.statusCode = 400;
        this.code = "VALIDATION_ERROR";
        this.errors = errors;
    }
}

/**
 * Creates validation middleware for a given schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Request property to validate ('body', 'query', 'params')
 */
function validate(schema, source = "body") {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const errors = result.error.errors.map(err => ({
                field: err.path.join("."),
                message: err.message
            }));

            return next(new ValidationError(errors));
        }

        // Replace with validated/sanitized data
        req[source] = result.data;
        next();
    };
}

/**
 * Pre-built validators for common endpoints
 */
const validators = {
    askQuestion: validate(schemas.askQuestion, "body")
};

module.exports = {
    schemas,
    validate,
    validators,
    ValidationError
};
