var _ = require('lodash');

Array.prototype.move = function (old_index, new_index) {
    // Shortcut helper to move item to end of array
    if (-1 === new_index) {
        new_index = this.length - 1;
    }

    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};

_.mixin({
    'sortKeysDeepBy': function (obj, order, options, sortAlgo) {
        order = order || ['asc'];

        if (_.isArray(obj)) {
            return _.map(obj, function (value) {
                if (!_.isNumber(value) && !_.isFunction(value) && _.isObject(value)) {
                    return _.sortKeysDeepBy(value, order, options, sortAlgo);
                } else {
                    return value;
                }
            });
        } else {
            var keys = _.orderBy(_.keys(obj), [], order);

            if (sortAlgo === 'keyLength') {
                var keyLengths = _.map(_.keys(obj), function (x) { return { 'key': x, 'keyLength': x.length }; });
                keyLengths = _.orderBy(keyLengths, ['keyLength'], order);
                keys = _.map(keyLengths, 'key');
            }

            if (sortAlgo === 'alphaNum') {
                var asc = true;
                if (order.length > 0) {
                    asc = order[0] === 'asc';
                }

                keys = _.keys(obj).sort(function (a, b) {
                    return a.localeCompare(b, 'en', { numeric: true }) * (asc ? 1 : -11);
                });
            }

            if (options && options.orderOverride) {
                var orderOverride = options.orderOverride.slice().reverse();
                orderOverride.forEach(function (key) {
                    var index = _.findIndex(keys, function (o) { return o === key; });
                    if (-1 !== index) {
                        keys.move(index, 0);
                    }
                })
            }

            if (options && options.orderUnderride) {
                var orderUnderride = options.orderUnderride.slice();
                orderUnderride.forEach(function (key) {
                    var index = _.findIndex(keys, function (o) { return o === key; });
                    if (-1 !== index) {
                        keys.move(index, -1);
                    }
                })
            }

            return _.zipObject(keys, _.map(keys, function (key) {
                if (!_.isNumber(obj[key]) && !_.isFunction(obj[key]) && _.isObject(obj[key])) {
                    obj[key] = _.sortKeysDeepBy(obj[key], order, options, sortAlgo);
                }
                return obj[key];
            }));
        }
    }
});