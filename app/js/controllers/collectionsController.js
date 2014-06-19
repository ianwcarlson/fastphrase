(function(){
	'use strict';
	var controllerModule = angular.module('controllerModule', []);

    controllerModule.controller('collectionsController', [
        '$scope', '$rootScope', 'wordSetManager', '$firebase', '$state',
        function($scope, $rootScope, wordSetManager, $firebase, $state){

        $scope.editMode = true;
        $scope.toggleEditMode = function(){
            $scope.editMode = !$scope.editMode;
        };

        var wordSetRef = new Firebase('https://blistering-fire-4858.firebaseio.com/wordset');

        $scope.collections = $firebase(wordSetRef);

        $scope.removeItem = function(id){
            //wordSetManager.deleteCollection(index);
            //$scope.collections = wordSetManager.getCollectionsFromWordSet();
            //$scope.collections.splice(index, 1);
            //var key = $scope.collections[index];
            //var itemRef = new Firebase('https://blistering-fire-4858.firebaseio.com/wordset' + '/' + id);
            //itemRef.remove();
            $scope.collections.$remove(id);
        };
        $scope.addItem = function(){
            var newObject = {};
            newObject.collectionName = $scope.inputText;
            //wordSetManager.addCollection($scope.inputText);
            //$scope.collections.push(wordSetManager.getCollectionByName($scope.inputText));
            $scope.collections.$add(newObject);
            $scope.inputText = '';
        };
        $scope.addItemKeyPress = function(ev){
            if (ev.which==13){
                $scope.addItem();
            }
        };
        $scope.nextPage = function(selectedIndex, collectionName){
            wordSetManager.setActiveCollection(selectedIndex);
            $state.go('words', {action: 'push', title: collectionName});
            //$rootScope.ons.navigator.pushPage('words.html', {title: collectionName})
        }
    }]);

    controllerModule.controller('wordsController', [
        '$scope', '$rootScope', 'wordSetManager', '$firebase', '$state',
        function($scope, $rootScope, wordSetManager, $firebase, $state){

            $scope.editMode = false;
            $scope.toggleEditMode = function(){
                $scope.editMode = !$scope.editMode;
            };
            $scope.showDef = false;
            var activeCollectionKey = wordSetManager.getActiveCollection();

            var collectionRef = new Firebase('https://blistering-fire-4858.firebaseio.com/wordset' +
                '/' + activeCollectionKey);

            $scope.words = $firebase(collectionRef);

            $scope.filterNonCollections = function(items) {
                var result = {};
                angular.forEach(items, function(value, key) {
                    if (value.hasOwnProperty('word')) {
                        result[key] = value;
                    }
                });
                return result;
            };
            $scope.removeItem = function(id){
                //wordSetManager.deleteWord(index);
                //$scope.collections = wordSetManager.getCollectionsFromWordSet();
                //$scope.words.splice(index, 1);
                $scope.words.$remove(id);
            };
            $scope.addItem = function(){
                var newObject = {};
                newObject.word = $scope.inputText;
                //wordSetManager.addWord($scope.inputText, $scope.words.length+1);
                //var wordObj = wordSetManager.getWordByName($scope.inputText);
                //$scope.words.push(wordObj);
                $scope.words.$add(newObject);
                $scope.inputText = '';
            };
            $scope.addItemKeyPress = function(ev){
                if (ev.which==13){
                    $scope.addItem();
                }
            };
            $scope.nextPage = function(selectedIndex, wordName){
                wordSetManager.setActiveWord(selectedIndex);
                //$rootScope.ons.navigator.pushPage('definitions.html', {title: wordName})
                $state.go('definitions', {action: 'push', title: wordName});
            }
        }]);

    controllerModule.controller('definitionController', [
        '$scope', 'wordSetManager', '$firebase',
        function($scope, wordSetManager, $firebase){

            var activeWordKey = wordSetManager.getActiveWord();
            var activeCollectionKey = wordSetManager.getActiveCollection();

            var pathString = 'https://blistering-fire-4858.firebaseio.com/wordset' +
                '/' + activeCollectionKey + '/' + activeWordKey;

            var definitionRef = new Firebase(pathString + '/' + 'definition');
            var fireBaseDefinitionRef = $firebase(definitionRef);
            fireBaseDefinitionRef.$bind($scope.$parent, 'inputText');

        }])
})();
