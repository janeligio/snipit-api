export default {
    SCHEMAS: {
        USER: {
            USERNAME: {
                MIN_LENGTH: 3,
                MAX_LENGTH: 30
            },
            EMAIL: {
                MIN_LENGTH: 4,
                MAX_LENGTH: 100
            },
            PASSWORD: {
                MIN_LENGTH: 8,
                MAX_LENGTH: 200
            },
            NAME: {
                MIN_LENGTH: 4,
                MAX_LENGTH: 100
            },
            BIO: {
                MAX_LENGTH: 250
            }
        },
        SNIPPET_GROUP: {
            // TODO: Fill in
        },
        SNIPPET: {
            // TODO: Fill in
        },
    },
    ROUTES: {
        // Authentication
        AUTHENTICATION: {
            REGISTER: '/register',
            LOGIN: '/login',
        },
        // Snippets
        SNIPPET: {
            ALL: '/all',
            SNIPPET_ALL: '/snippet/all',
            USER_USERNAME: '/user/:username',
            SNIPPETGROUPID: '/:snippetGroupId',
            SNIPPET_SNIPPETID: '/snippet/:snippetId',
            CREATE: '/create',
            DELETE: '/delete',
            SNIPPET_DELETE: '/snippet/delete',
            EDIT_PRIVATE: '/edit/private',
            EDIT_SNIPPET: '/edit/snippet',
        },
        // Users
        USER: {
            PRIVATE: '/private',
            PUBLIC: '/public',
            EDIT: '/edit',
        },
    }
}