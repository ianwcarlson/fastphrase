var serviceModule = angular.module('servicesModule', []);

serviceModule.factory('wordSetManager', function(){
    function Collection(collectionName, index){
        this.index = index;
        this.collectionName = collectionName;
        this.words = []
    }
    function Word(wordName, index){
        this.index = index;
        this.word = wordName;
        this.definition = '';
    }
    var activeCollectionIndex = 0;
    var activeWordIndex = 0;
    var wordSet = [];

    return{
        setActiveCollection: function(collectionIndex){
            activeCollectionIndex = collectionIndex;
        },
        getActiveCollection: function(){
            return activeCollectionIndex;
        },
        setActiveWord: function(wordIdx){
            activeWordIndex = wordIdx;
        },
        getActiveWord: function(){
            return activeWordIndex;
        },
        getWordSet: function(){
            return wordSet;
        },
        getCollectionsFromWordSet: function(){
            var collectionsArray = [];
            for (var idx=0; idx<wordSet.length; idx++){
                var collectionObj = {};
                collectionObj.collectionName = wordSet[idx].collectionName;
                collectionsArray.push(collectionObj);
            }
            return collectionsArray;
        },
        getCollectionByName: function(name){
            for (var idx=0; idx<wordSet.length; idx++){
                if (wordSet[idx].collectionName === name){
                    var collectionObj = {};
                    collectionObj.collectionName = wordSet[idx].collectionName;
                    return collectionObj;
                }

            }
        },
        getWordsFromActiveCollection: function(){
            return wordSet[activeCollectionIndex].words;
        },
        getWordsFromCollection: function(index){
            return wordSet[index].words;
        },
        addCollection: function(newCollectionName, index){
            var newCollectionObj = new Collection(newCollectionName, index);
            wordSet.push(newCollectionObj);
        },
        deleteCollection: function(collectionIndex){
            wordSet.splice(collectionIndex, 1);
        },
        addWord: function(newWordName, index){
            var newWord = new Word(newWordName, index);
            wordSet[activeCollectionIndex].words.push(newWord);
        },
        deleteWord: function(wordIndex){
            wordSet[activeCollectionIndex].words.splice(wordIndex, 1);
        },
        getWordByName: function(name){
            for (var idx=0; idx<wordSet[activeCollectionIndex].words.length; idx++){
                var wordRef = wordSet[activeCollectionIndex].words[idx].word;
                if (wordRef === name){
                    return wordSet[activeCollectionIndex].words[idx];
                }

            }
        },
        getDefinitionFromWord: function(wordIndex){
            return wordSet[activeCollectionIndex].words[wordIndex].definition;
        }
    }
});

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


