/**
 * Created by Azad on 08/07/2015.
 */

var deliverable = function(shortname) {
    $('#deliverables .active').removeClass('active');
    $('#'+shortname).addClass('active');

    $.ajax(
        {
            url: '/deliverable/' + shortname + '/',
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