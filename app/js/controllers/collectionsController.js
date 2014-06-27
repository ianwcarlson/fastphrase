(function(){
	'use strict';
	var controllerModule = angular.module('controllerModule', []);

    controllerModule.controller('collectionsController', [
        '$scope', '$rootScope', 'wordSetManager', '$firebase', '$state', 'loginService',
        function($scope, $rootScope, wordSetManager, $firebase, $state, loginService){

        $scope.editMode = true;
        $scope.toggleEditMode = function(){
            $scope.editMode = !$scope.editMode;
        };
        var user = loginService.getUser();
        var firebaseUrl = 'https://blistering-fire-4858.firebaseio.com/' + user.id;
        var wordSetRef = new Firebase(firebaseUrl);

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
        '$scope', '$rootScope', 'wordSetManager', '$firebase', '$state', 'loginService',
        function($scope, $rootScope, wordSetManager, $firebase, $state, loginService){

            $scope.editMode = false;
            $scope.toggleEditMode = function(){
                $scope.editMode = !$scope.editMode;
            };
            $scope.showDef = false;
            var activeCollectionKey = wordSetManager.getActiveCollection();

            var user = loginService.getUser();
            var firebaseUrl = 'https://blistering-fire-4858.firebaseio.com/' + user.id;
            var collectionRef = new Firebase(firebaseUrl + '/' + activeCollectionKey);
            var wordCountRefNode = new Firebase(firebaseUrl + '/' + activeCollectionKey + '/' + 'wordCount')

            $scope.words = $firebase(collectionRef);
            var wordCountRef = $firebase(wordCountRefNode);

            $scope.wordCount = 0;
            wordCountRef.$bind($scope, 'wordCount');
            syncWordCount();

            function syncWordCount(){
                var keys = $scope.words.$getIndex();
                for (var idx=0; idx<keys.length; idx++){
                    if (keys[idx] !== 'wordCount' && keys[idx] !== 'collectionName'){
                        $scope.wordCount += 1;
                    }
                }
            }

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
                $scope.wordCount -= 1;
            };
            $scope.addItem = function(){
                var newObject = {};
                newObject.word = $scope.inputText;
                //wordSetManager.addWord($scope.inputText, $scope.words.length+1);
                //var wordObj = wordSetManager.getWordByName($scope.inputText);
                //$scope.words.push(wordObj);
                $scope.words.$add(newObject);
                $scope.inputText = '';
                $scope.wordCount += 1;
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
        '$scope', 'wordSetManager', '$firebase','loginService',
        function($scope, wordSetManager, $firebase, loginService){

            var activeWordKey = wordSetManager.getActiveWord();
            var activeCollectionKey = wordSetManager.getActiveCollection();

            var user = loginService.getUser();
            var firebaseUrl = 'https://blistering-fire-4858.firebaseio.com/' + user.id +
                '/' + activeCollectionKey + '/' + activeWordKey;

            var definitionRef = new Firebase(firebaseUrl + '/' + 'definition');
            var fireBaseDefinitionRef = $firebase(definitionRef);
            fireBaseDefinitionRef.$bind($scope.$parent, 'inputText');

        }])
})();
