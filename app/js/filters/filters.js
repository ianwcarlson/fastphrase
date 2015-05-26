var filtersModule = angular.module('filtersModule', []);
/**
 * Custom Angular filter to filter unwanted keys in Firebase returns
 * JS object.  Contains a mixture of the added keys along with properties
 * and methods already contain within.
 */
filtersModule.filter('filterNonCategories', function(){
    return function(items){
        var result = {};
        angular.forEach(items, function(value, key){
            if (key !== 'scores' && key !== 'turns' && key !== '$add' &&
                key !== '$auth' && key !== '$bind' && key !== '$child' &&
                key !== '$getIndex' && key !== '$getRef' && key !== '$id' &&
                key !== '$off' && key !== '$on' && key !== '$remove' &&
                key !== '$save' && key !== '$set' && key !== '$transaction' &&
                key !== '$update'){
                result[key] = value;
            }
        });
        return result;
    };
});



