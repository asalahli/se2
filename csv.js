/**
 * Created by Azad on 23/06/2015.
 */

(function() {

    var parse = function(str) {
        var csv_data = new Array();

        var lines = str.split('\n');

        for (var i=0; i<lines.length; i++) {
            var cell = lines[i].trim().split(',');

            if (cell.length > 1) {
                csv_data.push(cell);
            }
        }

        return csv_data;
    };


    module.exports.parse = parse;
})();