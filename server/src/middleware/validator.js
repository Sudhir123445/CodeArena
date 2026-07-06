const { BadRequestError } = require('../utils/errors');

/**
 * Middleware factory: Validate request data against a Zod schema.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Which part of the request to validate
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return next(
        new BadRequestError(
          `Validation failed: ${errors.map((e) => `${e.field} — ${e.message}`).join('; ')}`
        )
      );
    }

    // Replace with parsed + coerced data
    req[source] = result.data;
    next();
  };
};

module.exports = { validate };
