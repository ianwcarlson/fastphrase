(function(){
	'use strict';
	var playControllerModule = angular.module('playControllerModule', []);

    playControllerModule.controller('playController', [
        '$scope', '$firebase', '$timeout','loginService', '$rootScope', '$q',
        function($scope, $firebase, $timeout, loginService, $rootScope, $q){

        var NUM_TEAMS = 2;
        $scope.collections = [];

        var user = loginService.getUser();
        var wordPlayManagerObj = wordPlayManager();

        var firebaseUrl = 'https://blistering-fire-4858.firebaseio.com/' + user.id;
        var wordSetRef = new Firebase(firebaseUrl);

        $scope.collections = $firebase(wordSetRef);
        $scope.collections.$on('loaded', function(){
            //var filteredCategories = {};
            for (var item in $scope.collections){
                if (angular.isDefined($scope.collections[item].collectionName)){
                    // get the first item and exit loop
                    $scope.selectedCollection = $scope.collections[item];
                    break;
                }

            }

            wordPlayManagerObj.setCategoryList($scope.collections);
        });

        //for (var item in collections) {
        //    var value = collections[item];
        //    if (value.collectionName) {
        //        $scope.collections.push({name: value.collectionName});
        //    }
        //}
        //$scope.selectedCollection = $scope.collections[0];

        var playTimer = new TimerClass();
        var turnManagerObj = turnManager();
        var scoreManagerObj = scoreManager();


        $scope.incrementTeam = scoreManagerObj.incrementTeam;
        $scope.decrementTeam = scoreManagerObj.decrementTeam;

        $scope.resetGame = function(){
            scoreManagerObj.resetScores();
            wordPlayManagerObj.resetWordGroup();
            playTimer.cancelTimer();
            turnManagerObj.resetTurn();
        };

        function incrementScore(){
            var selectedTeam = turnManagerObj.getActiveTeam();
            scoreManagerObj.incrementTeam(selectedTeam);
        }

        $scope.getNextWord = function() {
            // TEMP IWC
            //if (playTimer.isPlayActive()) {
            wordPlayManagerObj.getNextWord();
            incrementScore();
            //}
        };



        $scope.startNewRound = function(){
            playTimer.startTimer();
            incrementScore();
            wordPlayManagerObj.getNextWord();
        };
        var endTurnTasks = function(){
            turnManagerObj.nextTurn();
        };
        playTimer.timerEndCallback(endTurnTasks);

        //$scope.triggerNextWord = function(){
            //if (playTimer.isPlayActive()) {
                //$rootScope.$broadcast('triggerNextWord');
            //}
        //};

        function wordPlayManager(){
            var playWordSet = [];
            //var scopeObjects = ['word0', 'word1', 'word2'];
            var liveObjectView = [];
            var initialWordSet;
            var categoryList;

            //var scopeObjectIdx;

            function gatherWords() {
                var deferred = $q.defer();
                if (angular.isDefined(categoryList)){
                    for (var item in categoryList) {
                        var value = categoryList[item];
                        if (angular.isDefined(value.collectionName)) {
                            if (value.collectionName === $scope.selectedCollection.collectionName) {
                                var collectionHashKey = item;
                                var url = 'https://blistering-fire-4858.firebaseio.com/' + user.id + '/' + collectionHashKey;
                                var wordSetRef = new Firebase(url);
                                initialWordSet = $firebase(wordSetRef);
                                initialWordSet.$on('loaded', function () {
                                    loadWordSet(initialWordSet);
                                    deferred.resolve();
                                })
                            }
                        }
                    }
                }
                return deferred.promise;
            }

            function loadWordSet(words){

                for (var word in words) {
                    var wordValue = words[word];
                    if (wordValue.word) {
                        playWordSet.push({
                            word: wordValue.word,
                            definition: wordValue.definition
                        });
                    }
                }
            }

            function resetLiveView(){
                liveObjectView = [
                    {word: '', definition: '', index: 2},
                    {word: '', definition: '', index: 0},
                    {word: '', definition: '', index: 1}
                ];
                //scopeObjectIdx = 2;
            }

            function updateLiveView(newWord){
                // save old index
                var oldIndex = liveObjectView[0].index;
                // shift left
                liveObjectView.splice(0, 1);
                // append next word and rotating index
                liveObjectView.push({
                    word: newWord.word,
                    definition: newWord.definition,
                    index: oldIndex
                });
                //incrementScopeObjectIdx();
            }

            //function incrementScopeObjectIdx(){
            //    scopeObjectIdx = (scopeObjectIdx === scopeObjects.length - 1) ?
            //        (0) : (scopeObjectIdx + 1);
            //}

            function calcIndexAndInsertWord(){
                var calcIndex = Math.round((playWordSet.length - 1) * Math.random());
                updateLiveView(playWordSet[calcIndex]);
                //$scope[scopeObject] = wordArray[calcIndex];
                playWordSet.splice(calcIndex, 1);
            }

            function updateOneScopeItem(liveObject, liveObjectElement){
                var index = liveObject[liveObjectElement].index;
                var scopeWordKey = 'word' + index;
                var scopeDefinitionKey = 'definition' + index;
                $scope[scopeWordKey] = liveObject[liveObjectElement].word;
                $scope[scopeDefinitionKey] = liveObject[liveObjectElement].definition;
            }

            function updateAllScopeItems(){
                for (var idx = 0; idx<liveObjectView.length; idx++){
                    updateOneScopeItem(liveObjectView, liveObjectView[idx].index);
                }
            }

            function resetWordGroup(){
                $rootScope.$broadcast('resetToInitial');
                resetLiveView();
                var gatherWordsPromise = gatherWords();
                gatherWordsPromise.then(function() {
                    calcIndexAndInsertWord();
                    $timeout(function () {
                        updateAllScopeItems();
                    }, 0);
                })
            }

            function getNextWord(){
                $rootScope.$broadcast('triggerNextWord');

                if (playWordSet.length < 3) {
                    loadWordSet(initialWordSet);
                }

                calcIndexAndInsertWord(playWordSet);
                $timeout(function(){
                    updateOneScopeItem(liveObjectView, liveObjectView.length-1);
                }, 0);

            }

            return{
                resetWordGroup: resetWordGroup,
                getNextWord: getNextWord,
                setCategoryList: function(newCategoryList){
                    categoryList = newCategoryList;
                    resetWordGroup();
                }
            }
        }

        function scoreManager(){
            var initialScore = [0,0];
            var scoreSync = autoSyncType('scores', initialScore);

            return{
                incrementTeam: function(team){
                    var newValue = scoreSync.getValue(team);
                    newValue += 1;
                    scoreSync.setValue(team, newValue);
                },
                decrementTeam: function(team){
                    if (scoreSync.getValue(team) > 0) {
                        var newValue = scoreSync.getValue(team);
                        newValue -= 1;
                        scoreSync.setValue(team, newValue);
                    }
                },
                resetScores: function(){
                    var names = scoreSync.getIndex();
                    names.forEach(function(name){
                        scoreSync.setValue(name, 0);
                    });
                }
            }
        }

        function turnManager(){
            var initialTurnState = [true, false];
            var turnSync = autoSyncType('turns', initialTurnState);
            var teamNames = turnSync.getIndex();

            var resetTurn = function(){
                teamNames.forEach(function(name){
                    if (name === 'team1') {
                        turnSync.setValue(name, true);
                    } else {
                        turnSync.setValue(name, false);
                    }
                });
            };

            var nextTurn = function(){
                var nextTurnIdx;
                var idx;
                for (idx=0; idx<teamNames.length; idx++){
                    var readValue = turnSync.getValue(teamNames[idx]);
                    if (readValue === true){
                        var idxPlusOne = idx + 1;
                        if (idxPlusOne === teamNames.length){
                            nextTurnIdx = 0;
                        } else {
                            nextTurnIdx = idxPlusOne;
                        }
                    }
                }
                for (idx=0; idx<teamNames.length; idx++){
                    var newValue = (nextTurnIdx === idx) ? true : false;
                    turnSync.setValue(teamNames[idx], newValue);
                }
            };

            var getActiveTeam = function(){
                var readValue;
                var activeTeam = '';
                for (var idx=0; idx<teamNames.length; idx++){
                    readValue = turnSync.getValue(teamNames[idx]);
                    if (readValue === true){
                        activeTeam = teamNames[idx];
                        break;
                    }
                }
                return activeTeam;
            };

            return{
                resetTurn: resetTurn,
                nextTurn: nextTurn,
                getActiveTeam: getActiveTeam
            }
        }

        function TimerClass(){
            var MAX_PRE_COUNT = 1;
            var time = 0;
            var maxTimeSecs = 5;
            var preCount = MAX_PRE_COUNT;
            var soundEnabled = true;
            var timerCancelled = false;
            var timerEndCallback = function(){};
            var beep = new Howl({urls: ['media/audio/beep-08b.mp3']});
            var buzzer = new Howl({urls: ['media/audio/008664315-buzzer.mp3']});
            var isPlayActive = false;
            var secondTick = function(){
                if (time > 0 && !timerCancelled){
                    // beep playing logic
                    if (soundEnabled) {
                        if (time > 15) {
                            if (preCount === 0) {
                                beep.play();

                                preCount = MAX_PRE_COUNT;
                            }
                            else {
                                preCount -= 1;
                            }

                        }
                        else {
                            //beep.src = beep.src;
                            beep.play();
                        }
                    }
                    time -= 1;
                    $timeout(secondTick, 1000);
                }
                else if(soundEnabled && !timerCancelled){
                    buzzer.play();
                    isPlayActive = false;
                    timerEndCallback();

                }
                else if (timerCancelled){
                    timerCancelled = false;
                    isPlayActive = false;
                }

            };

            return{
                setMaxTime: function(maxTimeSecs){

                },
                startTimer: function(){
                    time = maxTimeSecs;
                    isPlayActive = true;
                    $timeout(secondTick, 1);
                },
                cancelTimer: function(){
                    time = 0;
                    if (isPlayActive){
                        timerCancelled = true;
                    }
                },
                enableSound: function(isSoundEnabled){
                    soundEnabled = isSoundEnabled;
                },
                timerEndCallback: function(callback){
                    timerEndCallback = callback;
                },
                isPlayActive: function(){
                    return isPlayActive;
                }
            }
        }

        function autoSyncType(type, initialStateArray) {
            var firebaseUrl = 'https://blistering-fire-4858.firebaseio.com/' + user.id;
            var scoresDB = {};
            $scope[type] = {};
            var teamNames = [];
            var teamNameUrls = [];
            var teamRefArray = [];

            // instantiate function object to get initial DB state and
            // create one if it doesn't already exist
            var initialSnapshotCallback = function (snapshot) {
                if (snapshot.val() === null) {
                    scoresDB[teamNames[idx]].$set(initialStateArray[idx]);
                } else {
                    $scope[type][snapshot.name()] = snapshot.val();
                    teamRefArray[idx].off('value', initialSnapshotCallback);
                }
            };

            // initialize arrays and callback
            for (var idx = 0; idx < NUM_TEAMS; idx++) {
                teamNames[idx] = 'team' + (idx + 1);
                teamNameUrls[idx] = firebaseUrl + '/' + type + '/' + teamNames[idx];
                teamRefArray.push(new Firebase(teamNameUrls[idx]));
                scoresDB[teamNames[idx]] = $firebase(teamRefArray[idx]);

                teamRefArray[idx].on('value', initialSnapshotCallback);
            }

            // read local changes and propagate them to the back-end
            function syncDB() {
                var localData = [];
                for (var idx = 0; idx < NUM_TEAMS; idx++) {
                    // read current scores
                    localData[idx] = $scope[type][teamNames[idx]];
                    scoresDB[teamNames[idx]].$set(localData[idx]);
                }
            }
            function getValue(name){
                return $scope[type][name];
            }
            function setValue(name, newValue){
                $scope[type][name] = newValue;
                syncDB();
            }
            function getIndex(){
                return teamNames;
            }

            return{
                setValue: setValue,
                getValue: getValue,
                getIndex: getIndex
            }
        }



    }]);


})();
