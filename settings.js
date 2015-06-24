/**
 * Created by Azad on 18/06/2015.
 */

var DEPLOYMENT = 'local';

module.exports = {
    DB_NAME: '/db.sqlite3',
};

if (DEPLOYMENT === 'staging') {
    // se2.asalahli.webfactional.com
    module.exports.GITHUB_APP_NAME = 'se2-dev';
    module.exports.GITHUB_CLIENT_ID = '20635d012bfbada79b1f';
    module.exports.GITHUB_CLIENT_SECRET = 'a782863ea3ffa0173057c02646d3fe63a1765691';
}
else if (DEPLOYMENT === 'local') {
    // localhost:3000
    module.exports.GITHUB_APP_NAME = 'se2-localhost';
    module.exports.GITHUB_CLIENT_ID = '0e4d403cade87ee8b4bc';
    module.exports.GITHUB_CLIENT_SECRET = 'f862f69da8a2be710ea7226c543ca605157e659a';
}
