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
    var wordSet = [
        //{
        //    collectionName: '',
        //    words: []
        //}
    ];

    //var collection1 = new Collection('French Revolution', 0);
    //collection1.words.push(new Word('guillotine', 0));
    //collection1.words.push(new Word('bastille', 1));
    //wordSet.push(collection1);

    //var collection2 = new Collection('WWII', 0);
    //collection2.words.push(new Word('Hitler', 0));
    //collection2.words.push(new Word('Stalin', 1));
    //collection2.words.push(new Word('Japanese Internment Camps', 2));
    //wordSet.push(collection2);

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
                    //var wordObj = {};
                    //wordObj.word = wordSet[activeCollectionIndex].words[idx].word;
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

serviceModule.factory('localStorageWrapper', [
    'appConstants', 'localStorageService',
    function(appConstants, localStorageService){

    function SimpleStorageOption(inputDefault, inputOption){
        var defaultOption = inputDefault;
        var optionName = inputOption;

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

        function setOption(newValue){
            localStorageService.set(optionName, angular.toJson(newValue));
        }
        return {
            getOption: getOption,
            setOption: setOption
        }
    }

    var timeLimitOption = SimpleStorageOption(30, 'timeLimit');
    var enableSoundOption = SimpleStorageOption(true, 'enableSound');
    var playEnableOption = SimpleStorageOption(true, 'playEnable');

    function getTimeLimit(){
        return Number(timeLimitOption.getOption());
    }

    function setTimeLimit(newValue){
        timeLimitOption.setOption(newValue);
    }

    function setEnableSound(newValue){
        enableSoundOption.setOption(newValue);
    }
    function getEnableSound(){
        return enableSoundOption.getOption();
    }

    function setPlayEnable(newValue){
        playEnableOption.setOption(newValue);
    }
    function getPlayEnable(){
        return playEnableOption.getOption();
    }

    return{
        setTimeLimit: setTimeLimit,
        getTimeLimit: getTimeLimit,
        setEnableSound: setEnableSound,
        getEnableSound: getEnableSound,
        setPlayEnable: setPlayEnable,
        getPlayEnable: getPlayEnable,
    }
}]);

serviceModule.factory('broadcastStateChange', ['$rootScope',
    function($rootScope){
    return{
        modalState: function(newState){
            $rootScope.$broadcast('modalStateChange', newState);
        }
    }
}]);


