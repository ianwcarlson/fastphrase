(function(){
	'use strict';
	var controllerModule = angular.module('controllerModule', []);
    /**
     * Controller assigned to the Word Collections view
     */
    controllerModule.controller('collectionsController', [
        '$scope', '$rootScope', 'wordSetManager', '$state', 'loginService',
        'broadcastStateChange', 'localStorageWrapper', '$firebase',
        function($scope, $rootScope, wordSetManager, $state, loginService,
        broadcastStateChange, localStorageWrapper, $firebase){

        $scope.editMode = false;
        $scope.readOnly = localStorageWrapper.getReadOnly();
        /**
         * Toggles the edit mode if read-only mode is disabled
         */
        $scope.toggleEditMode = function(){
            if (!localStorageWrapper.getReadOnly()) {
                $scope.editMode = !$scope.editMode;
            }
        };
        $scope.modal = {};
        /**
         * Changes the visibility of the login modal
         * @param {Boolean} newState boolean of the new state to transition to
         */
        $scope.setHideModal = function(newState){
            broadcastStateChange.modalState(newState);
        };

        var user = loginService.getUser();
        //if (user !== null){
            var firebaseUrl = 'https://blistering-fire-4858.firebaseio.com/' + user.id;
            var wordSetRef = new Firebase(firebaseUrl);
        
            $scope.collections = $firebase(wordSetRef);
        //}
        /**
         * Removes word collection item from view and from database
         * @param  {String} id word collection name/id
         */
        $scope.removeItem = function(id){
            $scope.collections.$remove(id);
        };
        /**
         * Adds word collection item from input box to list
         */
        $scope.addItem = function(){
            var newObject = {};
            newObject.collectionName = $scope.inputText;
            newObject.wordCount = 0;
            $scope.collections.$add(newObject);
            $scope.inputText = '';
        };
        /**
         * Function that gets called when key is pressed.  If enter
         * key pressed then add the collection item to list
         * @param {Object} ev event object containing key codes
         */
        $scope.addItemKeyPress = function(ev){
            if (ev.which==13){
                $scope.addItem();
            }
        };
        /**
         * Goes to next page on the stack which would be the word lists
         * within each word collection
         * @param  {Number} selectedIndex selected index of the word collection of interest
         * @param  {String} collectionName name of collection selected
         */
        $scope.nextPage = function(selectedIndex, collectionName){
            wordSetManager.setActiveCollection(selectedIndex);
            $state.go('user.words', {
                action: 'push',
                title: collectionName,
                rightButtonIcon: 'fa fa-lg fa-pencil'
            });
        };
        /**
         * Determines which collection name to delete
         * @param {String} newKey Database generated key for the word collection 
         * to delete
         * @param {String} newCollectionName The collection name to name to delete
         */
        $scope.setKeyToDelete = function(newKey, newCollectionName){
            $scope.keyToDelete = newKey;
            $rootScope.confirmModal= {};
            $rootScope.confirmModal.collectionName = newCollectionName;
        };
        /**
         * Enables/disables the delete collection confirmation modal
         */
        $rootScope.confirmModalDelete = function(){
            $scope.collections.$remove($scope.keyToDelete);
        }
    }]);
    /**
     * Controller assigned to the Words view
     */
    controllerModule.controller('wordsController', [
        '$scope', '$rootScope', 'wordSetManager', '$firebase', '$state', 'loginService',
        'localStorageWrapper',
        function($scope, $rootScope, wordSetManager, $firebase, $state, loginService,
        localStorageWrapper){

            $scope.editMode = false;
            $scope.readOnly = localStorageWrapper.getReadOnly();
            /**
             * Toggles edit mode on the word list
             * @return {[type]}
             */
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

            /**
             * Goes through the database keys and determines which are valid words
             * and then counts them and saves to scope
             */
            function syncWordCount(){
                var keys = $scope.words.$getIndex();
                for (var idx=0; idx<keys.length; idx++){
                    if (keys[idx] !== 'wordCount' && keys[idx] !== 'collectionName'){
                        $scope.wordCount += 1;
                    }
                }
            }
            /**
             * Angular filter method to determine which items are valid words
             * to display so that ng-repeat can word on the database node that
             * contains other extraneous attributes and methods
             * @param  {Object} items array of items at the database node containing the words
             * @return {Object} object with keys that contain the 'word' property
             */
            $scope.filterNonCollections = function(items) {
                var result = {};
                angular.forEach(items, function(value, key) {
                    if (value.hasOwnProperty('word')) {
                        result[key] = value;
                    }
                });
                return result;
            };
            /**
             * Removes the specified word item
             * @param  {String} id id string corresponding to the word to be removed
             */
            $scope.removeItem = function(id){
                $scope.words.$remove(id);
                $scope.wordCount -= 1;
            };
            /**
             * Adds word to scope/view/database
             */
            $scope.addItem = function(){
                if (!localStorageWrapper.getReadOnly()) {
                    var newObject = {};
                    newObject.word = $scope.inputText;
                    $scope.words.$add(newObject);
                    $scope.inputText = '';
                    $scope.wordCount += 1;
                }
            };
            /**
             * Listens for enter key press
             * @param {Object} ev The browser event object containing key codes
             */
            $scope.addItemKeyPress = function(ev){
                if (ev.which==13){
                    $scope.addItem();
                }
            };
            /**
             * Add the definition page to the page stack
             * @param  {Number} selectedIndex the index of the selected word
             * @param  {String} wordName the name of the select word
             */
            $scope.nextPage = function(selectedIndex, wordName){
                wordSetManager.setActiveWord(selectedIndex);
                $state.go('user.definitions', {
                    action: 'push',
                    title: wordName
                });
            }
        }]);
    /**
     * Controller assigned the Definition view
     */
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
