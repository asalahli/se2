/**
 * Created by Azad on 18/06/2015.
 */

module.exports = {
    PORT: '3000',

    DB_NAME: '/priv/db.sqlite3',

    // Github App
    GITHUB_APP_NAME: 'CS 410 Project Management',

	GITHUB_CLIENT_ID: '0e4d403cade87ee8b4bc',
	GITHUB_CLIENT_SECRET: 'f862f69da8a2be710ea7226c543ca605157e659a',
	
    // Course specific
    MIN_GROUP_SIZE: 3,
    MAX_GROUP_SIZE: 4,

    admins: [
        {
        githubId: 'foo',
        name: 'John Doe',
        role: 'ta'
        },
        {
        githubId: 'bar',
        name: 'Jane Doe',
        role: 'prof'
        }
    ]
};
