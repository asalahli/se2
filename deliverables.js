/**
 * Created by Azad on 18/06/2015.
 */


(function() {

    var getAllDeliverables = function(onSuccess, onError) {
        var deliverables_query = 'SELECT name, weight FROM deliverables;';
        var components_query = 'SELECT deliverable, name, open_date, close_date FROM deliverable_components;';

        db.all(deliverables_query, function(error, deliverables) {

            for (var i=0; i<deliverables.length; i++) {
                deliverables[i].components = new Array();
            }

            db.all(components_query, function(error, components) {
                for (var i=0; i<components.length; i++) {
                    components[i].open_date = new Date(components[i].open_date);
                    components[i].close_date = new Date(components[i].close_date);

                    for (var j=0; j<deliverables.length; j++) {
                        if (deliverables[j].name === components[i].deliverable) {
                            deliverables[j].components.push(components[i]);
                        }
                    }
                }

                onSuccess(deliverables);
            });

        });
    };

    var getDeliverable = function(name, onSuccess, onError) {
        var deliverable_query = 'SELECT name, weight FROM deliverables WHERE name = ?';
        var components_query = 'SELECT deliverable, name, open_date, close_date FROM deliverable_components WHERE deliverable = ?';

        db.get(deliverable_query, [name], function(error, deliverable) {
            db.all(components_query, [name], function(error, components) {
                for (var i=0; i<components.length; i++) {
                    components[i].open_date = new Date(components[i].open_date);
                    components[i].close_date = new Date(components[i].close_date);
                }

                deliverable.components = components;
                onSuccess(deliverable);
            });
        });
    };

    /**
     * @param deliverables  {json}
     * @param onSuccess     {callback}
     * @param onError       {callback}
     */
    var importFromJson = function(deliverables, onSuccess, onError) {
        // TODO: Prevent SQL injection

        var query = ['BEGIN TRANSACTION;'];
        for (var deliverable_name in deliverables) {
            var deliverable = deliverables[deliverable_name];

            query.push(['    ',
                'INSERT INTO deliverables (name, weight) ',
                'VALUES ("', deliverable_name, '","', deliverable.weight, '");'
            ].join(''));

            for (var component_name in deliverable) {
                if (component_name === 'weight') continue;

                var component = deliverable[component_name];

                var open_date = component.opens ? new Date(component.opens) : new Date();
                var close_date = new Date(component.closes);

                query.push(['        ',
                    'INSERT INTO deliverable_components (deliverable, name, open_date, close_date) ',
                    'VALUES ("', deliverable_name, '","', component_name, '","',
                    open_date.getTime(), '","', close_date.getTime(), '");'
                ].join(''));
            }
        }
        query.push('END TRANSACTION;');

        db.exec(query.join('\n'), function() {
            onSuccess();
        });
    };


    module.exports.getDeliverable = getDeliverable;
    module.exports.getAllDeliverables = getAllDeliverables;
    module.exports.importFromJson = importFromJson;

})();
