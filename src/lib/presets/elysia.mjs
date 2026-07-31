/**
 * Elysia (Bun HTTP framework) server-route conventions: `detail.summary` and
 * `detail.description` carry OpenAPI copy, and error helpers take a message as
 * their second argument. Helper names are defaults, overridable via the
 * `errorHelperFunctions` option.
 */
export const elysia = {
    checkElysiaRouteDetails: true,
    errorHelperFunctions: [
        'badRequest', 'unauthorized', 'forbidden', 'notFound', 'conflict',
        'tooManyRequests', 'internalError',
    ],
};
