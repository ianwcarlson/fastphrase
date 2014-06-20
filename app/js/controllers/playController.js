(function(){
	'use strict';
	var playControllerModule = angular.module('playControllerModule', []);

    playControllerModule.controller('playController', [
        '$scope', '$firebase', '$timeout','loginService',
        function($scope, $firebase, $timeout, loginService){

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
            var currentState = turnManagerObj.getCurrentState();
            var selectedTeam = '';
            if (currentState.team1) {
                selectedTeam = 'team1';
            }
            else {
                selectedTeam = 'team2';
            }
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
            turnManagerObj.toggleTurn();
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
            $scope.scores = {};
            $scope.scores.team1 = 0;
            $scope.scores.team2 = 0;

            return{
                incrementTeam: function(team){
                    $scope.scores[team] += 1;
                },
                decrementTeam: function(team){
                    if ($scope.scores[team] > 0) {
                        $scope.scores[team] -= 1
                    }
                },
                resetScores: function(){
                    $scope.scores = {};
                    $scope.scores.team1 = 0;
                    $scope.scores.team2 = 0;
                }
            }
        }

        function turnManager(){
            $scope.team1 = true;
            $scope.team2 = false;

            var resetTurn = function(){
                $scope.team1 = true;
                $scope.team2 = false;
            };

            var toggleTurn = function(){
                if ($scope.team1){
                    $scope.team1 = false;
                    $scope.team2 = true;
                }
                else{
                    $scope.team1 = true;
                    $scope.team2 = false;
                }
            };

            return{
                resetTurn: resetTurn,
                toggleTurn: toggleTurn,
                getCurrentState: function(){
                    var returnObj = {};
                    returnObj.team1 = $scope.team1;
                    returnObj.team2 = $scope.team2;
                    return returnObj;
                }
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
                if (time > 0){
                    // beep playing logic
                    if (soundEnabled) {
                        if (time > 15) {
                            if (preCount === 0) {
                                //beep.src = beep.src;
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
                    //buzzer.src = buzzer.src;
                    buzzer.play();
                    isPlayActive = false;
                    timerEndCallback();

                }
                else if (timerCancelled){
                    timerCancelled = false;
                    isPlayActive = false;
                    timerEndCallback();
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
                    timerCancelled = true;
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

    }]);


})();
