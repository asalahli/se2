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


var gradeDetails = function(deliverable, componentId) {
    console.log(deliverable);
    for (var i=0; i<deliverable.components.length; i++)
        if (deliverable.components[i].rowid = componentId)
            break;

    var component = deliverable.components[i];

    $('#grade-modal .modal-title small').text('Your grade for the ' + component.type + ' component of ' + deliverable.name);
    $('#grade-modal .modal-body .grade span').text(component.grade.percentage + '% (' + component.grade.letter + ')');
    $('#grade-modal').modal('show');
};