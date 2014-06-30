var filtersModule = angular.module('filtersModule', []);

filtersModule.filter('filterNonCategories', function(){
    return function(items){
        var result = {};
        angular.forEach(items, function(value, key){
            if (key !== 'scores' && key !== 'turns'){
                result[key] = value;
            }
        });
        return result;

    };

});



