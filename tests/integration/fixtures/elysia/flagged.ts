/**
 * With the elysia preset on, route detail copy and error-helper messages are
 * reported even though they are not in JSX.
 */
export const routes = app.get('/users', handler, {
    // expect-warning: List all users
    detail: { summary: 'List all users' },
});

export function guard(user: User) {
    if (!user) {
        // expect-warning: No such user
        throw notFound('USER_MISSING', 'No such user');
    }
}
