var express = require('express');
var app = express();

var CSV = require('./csv.js');
var auth = require('./auth.js');
var settings = require('./settings.js');
var deliverables = require('./deliverables.js');
var students = require('./students.js');


var getUploadLocation = function(deliverable, userid) {
    var re = /[\:\?\*]/g;

    var location = __dirname + '/uploads/' + deliverable.replace(re, '') + '/';

    if (userid !== '')
        location +=  userid + '.pdf';

    return location;
};


var getSubmissionInfo = function(student, deliverable, component) {
    var submitter = deliverable.is_group ? student.group_id : student.userid;
    var upload_location = [__dirname, 'uploads', deliverable.shortname, component.rowid.toString(), ''].join('/');
    var file_type = component.type === 'document' ? '.pdf' : '.txt';

    var filepath = upload_location + submitter + file_type;

    if (!fs.existsSync(filepath))
        return undefined;

    var url, title;
    var submitted_on = fs.statSync(filepath).mtime;

    if (component.type === 'link') {
        url = fs.readFileSync(filepath, 'utf8').trim();
        title = url;
    }
    else {
        url = ['', 'download', deliverable.shortname, component.rowid, submitter + file_type].join('/');
        title = [submitter, deliverable.shortname, component.rowid + file_type].join('-');
    }

    return {
        url: url,
        title: title,
        submitted_on: submitted_on
    };
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
app.route('/login')

    .get(function(req, res) {
        res.render('login', { client_id: settings.GITHUB_CLIENT_ID });
    });


app.route('/after-login')

    .get(function(req, res) {
        var session_code = req.query.code;

        auth.getAccessToken(session_code, function(access_token, scope) {
            res.cookie('access_token', access_token);
            res.redirect('/');
        });
    });


app.route('/register')

    .get(function(req, res){
        var github_id = req.query.github;

        res.render('register', { github_id: github_id });
    })

    .post(function(req, res){
        var github_id = req.body.github_id;
        var userid = req.body.userid;
        var student_number = req.body.student_number;

        auth.assignGithubId(
            userid, student_number, github_id,
            function() {
                res.redirect('/');
            },
            function(){
                res.render('register', { github_id: github_id, error: true });
            }
        );
    });


app.route('/logout')

    .get(function(req, res) {
        res.cookie('access_token', '');
        res.redirect('/');
    });


var getLetterGrade = function(p){
    // Shamelessly stolen from Wikipedia
    if (86 <= p && p <= 100) return 'A';
    else if (73 <= p && p <= 85) return 'B';
    else if (67 <= p && p <= 72) return 'C+';
    else if (60 <= p && p <= 66) return 'C';
    else if (50 <= p && p <= 59) return 'C-';
    else if (0 <= p && p <= 49) return 'F';
    else return '';
};


app.get('/', auth.loginRequired, function(req, res) {
    deliverables.getAllDeliverables(function(deliverables) {
        res.render('home', { deliverables: deliverables });
    });
});


app.route('/deliverable/:name/')

    .get(auth.loginRequired, function(req, res) {
        var student_query = [
            'SELECT rowid, firstname, lastname, userid, student_number, group_id ',
            'FROM auth ',
            'WHERE userid = ? ',
            ';'
        ].join('');

        var deliverable_query = [
            'SELECT rowid, shortname, name, description, is_group, weight, open_date, close_date ',
            'FROM deliverables ',
            'WHERE shortname = ? ',
            ';'
        ].join('');

        var components_query = [
            'SELECT ',
            '   deliverable_components.rowid, ',
            '   deliverable_components.deliverable, ',
            '   deliverable_components.description, ',
            '   deliverable_components.type, ',
            '   deliverable_components.weight, ',
            '   grades.grade ',
            'FROM deliverable_components ',
            'LEFT JOIN grades ON ',
            '   deliverable_components.rowid = grades.component AND grades.submitter = ?',
            'WHERE deliverable_components.deliverable = ? ',
            ';'
        ].join('');

        var userid = req.user.userid;
        var deliverable_shortname = req.params.name;

        db.get(student_query, [userid], function(error, student) {
            db.get(deliverable_query, [deliverable_shortname], function(error, deliverable) {
                var submitter = deliverable.is_group ? student.group_id : student.userid;

                db.all(components_query, [submitter, deliverable_shortname], function(error, components) {
                    deliverable.components = components;
                    for (var i=0; i<components.length; i++) {
                        components[i].submission = getSubmissionInfo(student, deliverable, components[i]);

                        var p = components[i].grade;
                        if (p)
                            components[i].grade = {
                                percentage: p,
                                letter: getLetterGrade(p)
                            };
                    }

                    var context = {
                        student: student,
                        deliverable: deliverable
                    };

                    res.render('deliverable', context);
                });
            });
        });
    })

    .post(auth.loginRequired, function(req, res) {
        var userid = req.user.userid;
        var deliverable_shortname = req.params.name;

        deliverables.getDeliverable(deliverable_shortname, function(deliverable) {
            var submitter = deliverable.is_group ? req.user.group_id : req.user.userid;

            var dest = [__dirname, 'uploads', deliverable_shortname].join('/');

            if (!fs.existsSync(dest))
                fs.mkdirSync(dest);

            dest = dest + '/' + req.body.component;

            if (!fs.existsSync(dest))
                fs.mkdirSync(dest);

            if (req.body.type == 'document') {
                var filetype = '.' + req.files.file.extension;
                fs.renameSync(req.files.file.path, dest + '/' + submitter + filetype);
            }
            else {
                var filetype = '.txt';
                fs.writeFileSync(dest + '/' + submitter + filetype, req.body.text);
            }

            res.redirect('/');
        });
    });

app.get('/download/:deliverable/:component/:filename', auth.loginRequired, function(req, res) {
    var submitter = req.params.filename.substr(0, req.params.filename.length-4);
    var filetype = req.params.filename.substring(req.params.filename.length-4);

    if (submitter != req.user.userid && submitter != req.user.group_id) {
        res.sendStatus(403);
        return;
    }

    var dest = [__dirname, 'uploads', req.params.deliverable, req.params.component, req.params.filename].join('/');
    var filename = [submitter, req.params.deliverable, req.params.component + filetype].join('-');
    res.download(dest, filename);
});

app.route('/admin/deliverables')

    .get(function(req, res) {
       deliverables.getAllDeliverables(function(deliverables) {
           res.render('admin/deliverables', { deliverables: deliverables });
       });
    })

    .post(function(req, res) {
        json_data = JSON.parse(fs.readFileSync(req.files.json_file.path));

        deliverables.importFromJson(json_data, function(){
            res.redirect('/admin/deliverables');
        });
    });


app.route('/admin/students')

    .get(function(req, res) {
        students.getAllStudents(function(students) {
            res.render('admin/students', { students: students });
        });
    })

    .post(function(req, res) {
        csv_data = CSV.parse(fs.readFileSync(req.files.csv_file.path, 'utf8'));

        //console.log(csv_data);

        students.importFromCsv(csv_data, function() {
            res.redirect('/admin/students');
        });
    });

// Server
var server = app.listen(settings.PORT, function() {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

});