var serviceModule = angular.module('servicesModule', []);
/**
 * Maintains a group of collection and/or words.  Provides ways to manipulate
 * the data set.  Mainly used to remember which collection or word is selected
 * when navigating the page stack (to mimic mobile apps)
 */
serviceModule.factory('wordSetManager', function(){
    /**
     * Simple class to store a word collection
     * @param {String} collectionName the name of the collection
     * @param {Number} index          the numbered index the collection falls in
     */
    function Collection(collectionName, index){
        this.index = index;
        this.collectionName = collectionName;
        this.words = []
    }
    /**
     * Simple class to store words
     * @param {String} wordName the name of the word
     * @param {Number} index    the numbered index the word falls in
     */
    function Word(wordName, index){
        this.index = index;
        this.word = wordName;
        this.definition = '';
    }
    var activeCollectionIndex = 0;
    var activeWordIndex = 0;
    var wordSet = [];

    return{
        /**
         * Sets the active collection by index
         * @param {Number} collectionIndex
         */
        setActiveCollection: function(collectionIndex){
            activeCollectionIndex = collectionIndex;
        },
        /**
         * Gets the active collection index
         * @return {Number} collection index
         */
        getActiveCollection: function(){
            return activeCollectionIndex;
        },
        /**
         * Sets the active word
         * @param {Number} wordIdx [description]
         */
        setActiveWord: function(wordIdx){
            activeWordIndex = wordIdx;
        },
        /**
         * Gets active word by index
         * @return {Number} active word index
         */
        getActiveWord: function(){
            return activeWordIndex;
        },
        /**
         * Get word set
         * @return {Array} array of words
         */
        getWordSet: function(){
            return wordSet;
        },
        /** 
         * Gets collections from word set
         * @return {Array} array of collections
         */
        getCollectionsFromWordSet: function(){
            var collectionsArray = [];
            for (var idx=0; idx<wordSet.length; idx++){
                var collectionObj = {};
                collectionObj.collectionName = wordSet[idx].collectionName;
                collectionsArray.push(collectionObj);
            }
            return collectionsArray;
        },
        /**
         * Get collection by name.  Searches the collections and returns the 
         * one that matches the input parameter
         * @param  {String} name name of collection to search for
         * @return {Object}      collection object that matches
         */
        getCollectionByName: function(name){
            for (var idx=0; idx<wordSet.length; idx++){
                if (wordSet[idx].collectionName === name){
                    var collectionObj = {};
                    collectionObj.collectionName = wordSet[idx].collectionName;
                    return collectionObj;
                }

            }
        },
        /**
         * Get words from active collection
         * @return {Array} the words from the active collection
         */
        getWordsFromActiveCollection: function(){
            return wordSet[activeCollectionIndex].words;
        },
        /**
         * Get words from collection based off index
         * @param  {Number} index index of wordset
         * @return {Array}       array of words
         */
        getWordsFromCollection: function(index){
            return wordSet[index].words;
        },
        /**
         * Add collection.  
         * @param {String} newCollectionName new name of collection
         * @param {Number} index             index of new collection
         */
        addCollection: function(newCollectionName, index){
            var newCollectionObj = new Collection(newCollectionName, index);
            wordSet.push(newCollectionObj);
        },
        /**
         * Delete collection based off index
         * @param  {Number} collectionIndex index of collection to delete
         */
        deleteCollection: function(collectionIndex){
            wordSet.splice(collectionIndex, 1);
        },
        /**
         * Add word
         * @param {String} newWordName name of the new word
         * @param {Number} index       index of the new word
         */
        addWord: function(newWordName, index){
            var newWord = new Word(newWordName, index);
            wordSet[activeCollectionIndex].words.push(newWord);
        },
        /**
         * Delete word
         * @param  {Number} wordIndex Index of the word to be deleted
         */
        deleteWord: function(wordIndex){
            wordSet[activeCollectionIndex].words.splice(wordIndex, 1);
        },
        /**
         * Gets a word by its name
         * @param  {String} name name of word to get
         * @return {Object}      object containing the word to get
         */
        getWordByName: function(name){
            for (var idx=0; idx<wordSet[activeCollectionIndex].words.length; idx++){
                var wordRef = wordSet[activeCollectionIndex].words[idx].word;
                if (wordRef === name){
                    return wordSet[activeCollectionIndex].words[idx];
                }

            }
        },
        /**
         * Get definition from word
         * @param  {Number} wordIndex index of word to get
         * @return {String}           definition
         */
        getDefinitionFromWord: function(wordIndex){
            return wordSet[activeCollectionIndex].words[wordIndex].definition;
        }
    }
});
/**
 * App constants.  Haven't yet used this everything as intended.
 */
serviceModule.service('appConstants', [function(){
    this.firebaseMainUrl = 'https://blistering-fire-4858.firebaseio.com';
    this.TIME_LIMIT_SCALER = 1.8;
}]);
/**
 * Wrapper for local storage module
 */
serviceModule.factory('localStorageWrapper', [
    'appConstants', 'localStorageService',
    function(appConstants, localStorageService){
    /**
     * Subclass that had methods to access generic strings from local storage
     * @param {Polymorphic} inputDefault default value for input
     * @param {String} inputOption  name of the option
     */
    function SimpleStorageOption(inputDefault, inputOption){
        var defaultOption = inputDefault;
        var optionName = inputOption;
        /**
         * Gets option from local storage
         * @return {Polymorphic}
         */
        function getOption(){
            var value = defaultOption;
            if (localStorageService.isSupported) {
                var storedValue = angular.fromJson(localStorageService.get(optionName));
                if (angular.isDefined(storedValue) && storedValue != null)
                    value = storedValue;
                else{
                    value = defaultOption;
                }
            }
            return value;
        }
        /**
         * Sets option to local storage
         * @param {Polymorphic} newValue 
         */
        function setOption(newValue){
            localStorageService.set(optionName, angular.toJson(newValue));
        }
        return {
            getOption: getOption,
            setOption: setOption
        }
    }
    // defaults
    var timeLimitOption = SimpleStorageOption(30, 'timeLimit');
    var enableSoundOption = SimpleStorageOption(true, 'enableSound');
    var playEnableOption = SimpleStorageOption(true, 'playEnable');
    var readOnlyOption = SimpleStorageOption(false, 'readOnly');
    /**
     * Gets time limit
     * @return {Number} time limit
     */
    function getTimeLimit(){
        return Number(timeLimitOption.getOption());
    }
    /**
     * Sets time limit
     * @param {Number} newValue new time limit
     */
    function setTimeLimit(newValue){
        timeLimitOption.setOption(newValue);
    }
    /**
     * Sets enable sound setting
     * @param {Boolean} newValue true/false to enable sound
     */
    function setEnableSound(newValue){
        enableSoundOption.setOption(newValue);
    }
    /**
     * Gets enable sound setting
     * @return {Boolean} sound enabled boolean
     */
    function getEnableSound(){
        return enableSoundOption.getOption();
    }
    /**
     * Sets play enable
     * @param {Boolean} newValue true or false
     */
    function setPlayEnable(newValue){
        playEnableOption.setOption(newValue);
    }
    /**
     * Gets play enable
     * @return {Boolean} true or false
     */
    function getPlayEnable(){
        return playEnableOption.getOption();
    }
    /**
     * Set Read Only
     * @param {Boolean} newValue true or false
     */
    function setReadOnly(newValue){
        readOnlyOption.setOption(newValue);
    }
    /**
     * Gets read only
     * @return {Boolean} true or false
     */
    function getReadOnly(){
        return readOnlyOption.getOption();
    }

    return{
        setTimeLimit: setTimeLimit,
        getTimeLimit: getTimeLimit,
        setEnableSound: setEnableSound,
        getEnableSound: getEnableSound,
        setPlayEnable: setPlayEnable,
        getPlayEnable: getPlayEnable,
        setReadOnly: setReadOnly,
        getReadOnly: getReadOnly
    }
}]);
/**
 * Wrapper for broadcasting the event 'modalStateChange' to the whole app
 */
serviceModule.factory('broadcastStateChange', ['$rootScope',
    function($rootScope){
    return{
        modalState: function(newState){
            $rootScope.$broadcast('modalStateChange', newState);
        }
    }
}]);


