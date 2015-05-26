var filtersModule = angular.module('filtersModule', []);

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



