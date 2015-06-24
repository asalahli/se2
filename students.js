/**
 * Created by Azad on 23/06/2015.
 */


(function(){

    var getAllStudents = function(onSuccess, onError) {
        var query = 'SELECT rowid as id, firstname, lastname, userid, student_number, github_id FROM auth';

        db.all(query, function(error, students) {
            if (error) {
                console.error(error);
            }
            else if (students) {
                onSuccess(students);
            }
            else if (onError) {
                onError();
            }
        });
    };

    var importFromCsv = function(students, onSuccess, onError) {
        // TODO: Prevent SQL injection

        var ifirst = students[0].indexOf('FIRST');
        var ilast = students[0].indexOf('LAST');
        var isnum = students[0].indexOf('SNUM');
        var iuid = students[0].indexOf('ACCT');

        var query = ['BEGIN TRANSACTION;'];

        for (var i=1; i<students.length; i++) {
            query.push([
                'INSERT INTO auth (firstname, lastname, userid, student_number) ',
                'VALUES ("', students[i][ifirst], '","', students[i][ilast], '","',
                students[i][iuid], '","', students[i][isnum], '");'
            ].join(''));
        }

        query.push('END TRANSACTION;');

        console.log(query.join('\n'));
        onSuccess();
    };


    module.exports.getAllStudents = getAllStudents;
    module.exports.importFromCsv = importFromCsv;

})();