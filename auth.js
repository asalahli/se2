/**
 * Created by Azad on 18/06/2015.
 */


(function() {

    var request = require('request');
    var settings = require('./settings.js');


    /**
     * Second stage of OAuth authentication
     *
     * @param   session_code    Code obtained from the first stage
     * @param   onSuccess       Callback for when the authentication succeeds
     * @param   onError         (Optional) Callback for when it fails.
     */
    var getAccessToken = function(session_code, onSuccess, onError) {
        request.post(
            {
                url: 'https://github.com/login/oauth/access_token',
                headers: {
                    'Accept': 'application/json'
                },
                form: {
                    client_id: settings.GITHUB_CLIENT_ID,
                    client_secret: settings.GITHUB_CLIENT_SECRET,
                    code: session_code,
                }
            },

            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    data = JSON.parse(body);
                    onSuccess(data.access_token, data.scope);
                }
                else if (!error && onError) {
                    onError(response);
                }
                else if (error) {
                    console.error(error);
                }
            }
        );
    };


    /**
     * Authentication middleware. Use this as,
     *      app.get('/some/path', loginRequired, function(res, req) { ... });
     */
    var loginRequired = function(req, res, next) {
        var cookie = req.headers.cookie;

        if (!cookie) {
            // No `cookie` header
            res.redirect('/login');
            return;
        }

        var match = /access_token=[0-9a-zA-Z]+/.exec(cookie)

        if (!match) {
            // No `access_token` cookie
            res.redirect('/login');
            return;
        }

        var access_token = match[0].substring(13);

        console.log('Access token: ' + access_token);

        request.get(
            {
                url: 'https://api.github.com/user',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'token ' + access_token,
                    'User-Agent': settings.GITHUB_APP_NAME,
                }
            },

            function(error, response, body) {
                if (error || response.statusCode !== 200) {
                    console.error(response.status);
                    console.error(body);
                }

                data = JSON.parse(body);

                console.log('GitHub username: ' + data.login);

                getUserByGithubId(data.login, function(user) {
                    if (!user) {
                        // No user associated with this github id
                        res.redirect('/login');
                        return;
                    }

                    req.user = user;
                    next();
                });
            }
        );
    };


    var getUserByGithubId = function(githubId, onSuccess, onError) {
        var query = 'SELECT rowid, name, userid, student_number '
            + 'FROM auth '
            + 'WHERE github_id="'+githubId+'";';

        db.get(query, function(error, row) {
            if (error && onError) {
                onError(error);
            }
            else if (!error) {
                onSuccess(row);
            }
            else {
                console.error(error);
            }
        });
    };

    module.exports.getAccessToken = getAccessToken;
    module.exports.loginRequired = loginRequired;

})();