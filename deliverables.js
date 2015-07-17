/**
 * Created by Azad on 18/06/2015.
 */


(function() {

    var getAllDeliverables = function(onSuccess, onError) {
        var deliverables_query = 'SELECT shortname, name, description, is_group, weight, open_date, close_date FROM deliverables;';
        var components_query = 'SELECT rowid, deliverable, description, type, weight FROM deliverable_components;';

        db.all(deliverables_query, function(error, deliverables) {

            if (error && onError) {
                onError(error);
            }
            else if (error) {
                console.log(error);
            }

            for (var i=0; i<deliverables.length; i++) {
                deliverables[i].open_date = new Date(deliverables[i].open_date);
                deliverables[i].close_date = new Date(deliverables[i].close_date);
                deliverables[i].components = new Array();
            }

            db.all(components_query, function(error, components) {

                if (error && onError) {
                    onError(error);
                }
                else if (error) {
                    console.log(error);
                }

                for (var i=0; i<components.length; i++) {
                    for (var j=0; j<deliverables.length; j++) {
                        if (deliverables[j].shortname === components[i].deliverable) {
                            deliverables[j].components.push(components[i]);
                        }
                    }
                }

                onSuccess(deliverables);
            });

        });
    };

    var getDeliverable = function(name, onSuccess, onError) {
        var deliverable_query = 'SELECT shortname, name, description, is_group, weight, open_date, close_date FROM deliverables WHERE shortname= ?;';
        var components_query = 'SELECT rowid, deliverable, description, type, weight FROM deliverable_components WHERE deliverable = ?;';

        db.get(deliverable_query, [name], function(error, deliverable) {
            deliverable.open_date = new Date(deliverable.open_date);
            deliverable.close_date = new Date(deliverable.close_date);

            db.all(components_query, [name], function(error, components) {
                deliverable.components = components;
                onSuccess(deliverable);
            });
        });
    };

    var getTarget = function(deliverable, user) {
        if (deliverable.is_group == 1) {
            return user.group_id;
        }
        else {
            return user.userid;
        }
    };

    /**
     * @param deliverables  {json}
     * @param onSuccess     {callback}
     * @param onError       {callback}
     */
    var importFromJson = function(deliverables, onSuccess, onError) {
        // TODO: Prevent SQL injection

        var query = ['BEGIN TRANSACTION;'];
        query.push('    DELETE FROM deliverables;');
        query.push('    DELETE FROM deliverable_components;');

        for (var i in deliverables) {
            var deliverable = deliverables[i];

            var open_date = new Date(deliverable.opens);
            var close_date = new Date(deliverable.closes);

            query.push(['    ',
                'INSERT INTO deliverables (shortname, name, description, weight, open_date, close_date) ',
                'VALUES ("', deliverable.shortname, '","', deliverable.name, '","', deliverable.description,
                '","', deliverable.weight, '","', open_date.getTime(), '","', close_date.getTime(), '");'
            ].join(''));

            for (var j in deliverable.components) {
                var component = deliverable.components[j];

                query.push(['        ',
                    'INSERT INTO deliverable_components (deliverable, type, description, weight) ',
                    'VALUES ("', deliverable.shortname, '","', component.type, '","', component.description,
                    '","', component.weight, '");'
                ].join(''));
            }
        }
        query.push('END TRANSACTION;');

        // console.log(query.join('\n'));

        db.exec(query.join('\n'), function() {
            onSuccess();
        });
    };


    module.exports.getDeliverable = getDeliverable;
    module.exports.getAllDeliverables = getAllDeliverables;
    module.exports.getTarget = getTarget;
    module.exports.importFromJson = importFromJson;

})();
