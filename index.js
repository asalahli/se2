var express = require('express');
var app = express();

var auth = require('./auth.js');
var settings = require('./settings.js');
var deliverables = require('./deliverables.js');


var getUploadLocation = function(deliverable, userid) {
    var re = /[\:\?\*]/g;

    var location = __dirname + '/uploads/' + deliverable.replace(re, '') + '/';

    if (userid !== '')
        location +=  userid + '.pdf';

    return location;
};


// Template engine
app.set('view engine', 'jade');
app.set('views', __dirname + '/templates');


// File uploads
var fs = require('fs');
var multer  = require('multer');
app.use(multer({
    dest: __dirname + '/uploads/.temp',
}));


// Database
var sqlite3 = require('sqlite3').verbose();
db = new sqlite3.Database(__dirname + settings.DB_NAME);


// Static files
app.use('/static', express.static('static'));


// Routing
app.get('/', auth.loginRequired, function(req, res) {
    console.log('User: ' + req.user.userid);
    res.render('home');
});


app.get('/login', function(req, res) {
    res.render('login', { client_id: settings.GITHUB_CLIENT_ID });
});


app.get('/after-login', function(req, res) {
    var session_code = req.query.code;

    auth.getAccessToken(session_code, function(access_token, scope) {
        res.cookie('access_token', access_token);
        res.redirect('/');
    });

});


app.get('/logout', function(req, res) {
    res.cookie('access_token', '');
    res.redirect('/');
});


app.get('/deliverables', auth.loginRequired, function(req, res) {
    var userid = req.user.userid;

    deliverables.getAllDeliverables(function(deliverables) {
        for (var i=0; i<deliverables.length; i++) {
            deliverables[i].is_submitted = fs.existsSync(getUploadLocation(deliverables[i].name, userid));
        }

        res.render('deliverables', { deliverables: deliverables });
    });
});

app.get('/deliverable/:name/submission', auth.loginRequired, function(req, res) {
    deliverables.getDeliverable(req.params.name, function(deliverable) {
        var userid = req.user.userid;
        var dest = getUploadLocation(req.params.name, userid);

        var submission_info = {
            deliverable: deliverable,
            is_submitted: fs.existsSync(dest),
        };

        res.render('submission', submission_info);
    });
});

app.post('/deliverable/:name/submission', auth.loginRequired, function(req, res) {
    deliverables.getDeliverable(req.params.name, function(deliverable) {
        var userid = req.user.userid;
        var dest = getUploadLocation(req.params.name, '');

        if (!fs.existsSync(dest))
            fs.mkdirSync(dest);

        var dest = getUploadLocation(req.params.name, userid);

        fs.renameSync(req.files.file.path, dest);

        var submission_info = {
            deliverable: deliverable,
            is_submitted: fs.existsSync(dest),
            uploaded: true,
        };

        res.render('submission', submission_info);
    });
});

app.get('/download/:deliverable/:userid', auth.loginRequired, function(req, res) {
    var userid = req.user.userid;

    if (userid !== req.params.userid) {
        res.sendStatus(403);
        return;
    }

    var dest = getUploadLocation(req.params.deliverable, req.params.userid);
    var filename = req.params.userid + '_' + req.params.deliverable + '.pdf';
    res.download(dest, filename);
});

app.route('/admin/deliverables')

    .get(function(req, res) {
       deliverables.getAllDeliverables(function(deliverables){
           res.render('admin/deliverables', { deliverables: deliverables });
       });
    })

    .post(function(req, res) {
        json_data = JSON.parse(fs.readFileSync(req.files.json_file.path));

        deliverables.importFromJson(json_data, function(){
            res.redirect('/admin/deliverables');
        });
    });

// Server
var server = app.listen(3000, function() {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

});