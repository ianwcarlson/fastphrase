(function(){
	'use strict';
	var playControllerModule = angular.module('playControllerModule', []);

    playControllerModule.controller('playController', [
        '$scope', '$firebase', '$timeout','loginService',
        function($scope, $firebase, $timeout, loginService){

        var NUM_TEAMS = 2;
        $scope.collections = [];
        var user = loginService.getUser();
        var firebaseUrl = 'https://blistering-fire-4858.firebaseio.com/' + user.id;
        var wordSetRef = new Firebase(firebaseUrl);
        var collections = $firebase(wordSetRef);

        for (var item in collections) {
            var value = collections[item];
            if (value.collectionName) {
                $scope.collections.push({name: value.collectionName});
            }
        }
        $scope.selectedCollection = $scope.collections[0];

        var playTimer = new TimerClass();
        var turnManagerObj = turnManager();
        var scoreManagerObj = scoreManager();

        $scope.incrementTeam = scoreManagerObj.incrementTeam;
        $scope.decrementTeam = scoreManagerObj.decrementTeam;

        $scope.resetGame = function(){
            scoreManagerObj.resetScores();
            gatherWords();
            playTimer.cancelTimer();
            turnManagerObj.resetTurn();
        };

        var playWordSet = [];
        function gatherWords(){
            for (var item in collections) {
                var value = collections[item];
                if (value.collectionName === $scope.selectedCollection.name) {
                    var collectionHashKey = item;
                    var url = 'https://blistering-fire-4858.firebaseio.com/' + user.id + '/' + collectionHashKey;
                    var wordSetRef = new Firebase(url);
                    var words = $firebase(wordSetRef);
                    for (var word in words){
                        var wordValue = words[word];
                        if (wordValue.word){
                            playWordSet.push(wordValue.word);
                        }
                    }
                }
            }
        }

        function incrementScore(){
            var selectedTeam = turnManagerObj.getActiveTeam();
            scoreManagerObj.incrementTeam(selectedTeam);
        }

        $scope.getNextWord = function(isIncrementScore){
            if(playTimer.isPlayActive()) {
                if (playWordSet.length === 0) {
                    gatherWords();
                }
                var calcIndex = Math.round((playWordSet.length - 1) * Math.random());
                $scope.newWord = playWordSet[calcIndex];
                playWordSet.splice(calcIndex, 1);

                if (isIncrementScore.increment){
                    incrementScore();
                }
            }
        };

        $scope.startNewRound = function(){
            gatherWords();
            playTimer.startTimer();
            $scope.getNextWord({increment: false});
        };
        var endTurnTasks = function(){
            turnManagerObj.nextTurn();
        };
        playTimer.timerEndCallback(endTurnTasks);

        var windowHeight = window.innerHeight;
        var topHalfHeight = 280;
        var bottomBarHeight = 44;
        var bottomHalfHeight = windowHeight - topHalfHeight - bottomBarHeight;
        $timeout(function(){
            var element = document.getElementById("play-word-main-outer-id");
            element.style.height = bottomHalfHeight + 'px';
        }, 0);

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
            var buzzer = new Howl({urls: ['media/audio/beep-18.mp3']});
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
