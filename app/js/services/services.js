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

    function getTimeLimit(){
        var DEFAULT_TIME = 30;
        var timeLimitValue = DEFAULT_TIME;
        if (localStorageService.isSupported) {
            var timeLimit = angular.fromJson(localStorageService.get('timeLimit'));
            timeLimitValue = timeLimit || DEFAULT_TIME;
            //if (angular.isDefined(timeLimit)) {
            //    sliderValue = timeLimit;
            //}
            //else{
            //    sliderValue = 10;
            //}
        }
        return (Number(timeLimitValue));
    }

    function setTimeLimit(timeLimitSeconds){
        localStorageService.set('timeLimit', angular.toJson(timeLimitSeconds));
    }
    return{
        getTimeLimit: getTimeLimit,
        setTimeLimit: setTimeLimit
    }
}]);


