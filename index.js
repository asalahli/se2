var sanitize = require('sanitize-filename');
var express = require('express');
var app = express();


// Since this doesn't change, we can just load it once
var deliverables = require('./deliverables.js');

var getDeliverable = function(name) {
    for (var i=0; i<deliverables.length; i++)
        if (deliverables[i].name == name)
            break;

    if (i < deliverables.length)
        return deliverables[i];
    else
        return undefined;
}


var getUploadLocation = function(deliverable, userid) {
    var re = /[\:\?\*]/g;

    var location = __dirname + '/uploads/' + deliverable.replace(re, '') + '/';

    if (userid !== '')
        location +=  userid + '/';

    return location;
}


// Template engine
app.set('view engine', 'jade');
app.set('views', __dirname + '/templates');


// File uploads
var fs = require('fs');
var multer  = require('multer');
app.use(multer({
    dest: __dirname + '/uploads/.temp',
}));


// Static files
app.use('/static', express.static('static'));


// Routing
app.get('/', function(req, res) {
    res.render('home');
});


app.get('/deliverables', function(req, res) {
    var userid = 'asalahli';

    var delis = [];

    for (var i=0; i<deliverables.length; i++) {
        delis.push({
            name: deliverables[i].name,
            deadline: deliverables[i].deadline,
            is_submitted: fs.existsSync(getUploadLocation(deliverables[i].name, userid)),
        });
    }

    res.render('deliverables', { deliverables: delis });
});

app.get('/deliverable/:name/submission', function(req, res) {
    var deliverable = getDeliverable(req.params.name);

    var userid = 'asalahli';
    var filename = 'undefined' + '/' + userid + '.zip';

    var dest = getUploadLocation(req.params.name, userid);

    var files = new Array();

    if (fs.existsSync(dest)) {
        files = fs.readdirSync(dest);
    }

    var submission_info = {
        deliverable: deliverable,
        files: files,
    };

    res.render('submission', submission_info);
});

app.post('/deliverable/:name/submission', function(req, res) {
    var deliverable = getDeliverable(req.params.name);

    var userid = 'asalahli';

    var dest = getUploadLocation(req.params.name, '');

    if (!fs.existsSync(dest))
        fs.mkdirSync(dest);

    dest += userid + '/';

    if (!fs.existsSync(dest))
        fs.mkdirSync(dest);

    fs.renameSync(req.files.file.path, dest + req.files.file.originalname);

    var files = new Array();

    if (fs.existsSync(dest)) {
        files = fs.readdirSync(dest);
    }

    var submission_info = {
        deliverable: deliverable,
        files: files,
        uploaded: true,
    };

    res.render('submission', submission_info);
});

// Server
var server = app.listen(3000, function() {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

});