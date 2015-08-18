/**
 * Created by Azad on 24/07/2015.
 */

var gradeEntry = function(deliverable, component) {
    $.ajax(
        {
            url: '/admin/grades/' + deliverable + '/' + component + '/',
            type: 'GET',
            dataType: 'html',

            success: function(data, status) {
                $('#content-area').html(data);
            },

            error: function(xhr, status, errorThrown) {
                console.log(errorThrown);
            }
        }
    );
};
