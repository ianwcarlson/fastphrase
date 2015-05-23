(function(){
	'use strict';
	var controllerModule = angular.module('controllerModule', []);

    controllerModule.controller('collectionsController', [
        '$scope', '$rootScope', 'wordSetManager', '$firebase', '$state', 'loginService',
        'broadcastStateChange', 'localStorageWrapper',
        function($scope, $rootScope, wordSetManager, $firebase, $state, loginService,
        broadcastStateChange, localStorageWrapper){

        $scope.editMode = false;
        $scope.readOnly = localStorageWrapper.getReadOnly();
        $scope.toggleEditMode = function(){
            if (!localStorageWrapper.getReadOnly()) {
                $scope.editMode = !$scope.editMode;
            }
        };
        $scope.modal = {};
        $scope.setHideModal = function(newState){
            broadcastStateChange.modalState(newState);
        };

        var user = loginService.getUser();
        var firebaseUrl = 'https://blistering-fire-4858.firebaseio.com/' + user.id;
        var wordSetRef = new Firebase(firebaseUrl);

        $scope.collections = $firebase(wordSetRef);

        $scope.removeItem = function(id){
            $scope.collections.$remove(id);
        };
        $scope.addItem = function(){
            var newObject = {};
            newObject.collectionName = $scope.inputText;
            newObject.wordCount = 0;
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
            $state.go('user.words', {
                action: 'push',
                title: collectionName,
                rightButtonIcon: 'fa fa-lg fa-pencil'
            });
        };
        $scope.setKeyToDelete = function(newKey, newCollectionName){
            $scope.keyToDelete = newKey;
            $rootScope.confirmModal= {};
            $rootScope.confirmModal.collectionName = newCollectionName;
        };
        $rootScope.confirmModalDelete = function(){
            $scope.collections.$remove($scope.keyToDelete);
        }
    }]);

    controllerModule.controller('wordsController', [
        '$scope', '$rootScope', 'wordSetManager', '$firebase', '$state', 'loginService',
        'localStorageWrapper',
        function($scope, $rootScope, wordSetManager, $firebase, $state, loginService,
        localStorageWrapper){

            $scope.editMode = false;
            $scope.readOnly = localStorageWrapper.getReadOnly();
            $scope.toggleEditMode = function(){
                if (!$scope.readOnly) {
                    $scope.editMode = !$scope.editMode;
                }
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
                $scope.words.$remove(id);
                $scope.wordCount -= 1;
            };
            $scope.addItem = function(){
                if (!localStorageWrapper.getReadOnly()) {
                    var newObject = {};
                    newObject.word = $scope.inputText;
                    $scope.words.$add(newObject);
                    $scope.inputText = '';
                    $scope.wordCount += 1;
                }
            };
            $scope.addItemKeyPress = function(ev){
                if (ev.which==13){
                    $scope.addItem();
                }
            };
            $scope.nextPage = function(selectedIndex, wordName){
                wordSetManager.setActiveWord(selectedIndex);
                $state.go('user.definitions', {
                    action: 'push',
                    title: wordName
                });
            }

        }]);

    controllerModule.controller('definitionController', [
        '$scope', 'wordSetManager', '$firebase','loginService', 'localStorageWrapper',
        function($scope, wordSetManager, $firebase, loginService, localStorageWrapper){

            $scope.readOnly = localStorageWrapper.getReadOnly();

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
