(function(){
	'use strict';
	var playControllerModule = angular.module('playControllerModule', []);

    playControllerModule.controller('playController', [
        '$scope', '$firebase', '$timeout','loginService', '$rootScope', '$q', 'localStorageWrapper',
        'broadcastStateChange',
        function($scope, $firebase, $timeout, loginService, $rootScope, $q, localStorageWrapper,
        broadcastStateChange){

        var NUM_TEAMS = 2;
        $scope.collections = [];
        $scope.options = {};
        $scope.modalState = true;
        /**
         * Shows/hides confirmation modal
         * @param {[type]} newState [description]
         */
        $scope.setHideModal = function(newState){
            broadcastStateChange.modalState(newState);
            $scope.modalState = newState;
        };

        var user = loginService.getUser();
        var wordPlayManagerObj = wordPlayManager();
        var firebaseUrl = 'https://blistering-fire-4858.firebaseio.com/' + user.id;
        var wordSetRef = new Firebase(firebaseUrl);

        $scope.collections = $firebase(wordSetRef);
        $scope.collections.$on('loaded', 
            /**
             * Callback that gets called when the database is synched with the current
             * page.  Retrieves the available collections to chose from.
             */
            function(){
                for (var item in $scope.collections){
                    if (angular.isDefined($scope.collections[item].collectionName)){
                        // get the first item and exit loop
                        $scope.selectedCollection = $scope.collections[item];
                        break;
                    }

                }
                wordPlayManagerObj.setCategoryList($scope.collections);
            }
        );

        var playTimer = new TimerClass();
        var turnManagerObj = {};
        var scoreManagerObj = scoreManager();

        // bind service functions to scope functions
        $scope.options.playEnable = localStorageWrapper.getPlayEnable();
        $scope.incrementTeam = scoreManagerObj.incrementTeam;
        $scope.decrementTeam = scoreManagerObj.decrementTeam;

        /**
         * Resets all the game features including zeroing out the team
         * scores and resetting the timers
         * @return {[type]} [description]
         */
        $scope.resetGame = function(){
            scoreManagerObj.resetScores();
            wordPlayManagerObj.resetWordGroup();
            playTimer.cancelTimer();
            turnManagerObj.resetTurn();
        };
        /**
         * Resets the array of words that will be displayed (eventually)
         */
        $scope.changeWordSelection = function(){
            wordPlayManagerObj.resetWordGroup();
        };
        /**
         * Increments the selected team score
         */
        function incrementScore(){
            var selectedTeam = turnManagerObj.getActiveTeam();
            scoreManagerObj.incrementTeam(selectedTeam);
        }
        /**
         * Retreives the next word from the array and increments the current
         * selected team score
         */
        $scope.getNextWord = function() {
            if (playTimer.isPlayActive() || !$scope.options.playEnable) {
                wordPlayManagerObj.getNextWord();
                incrementScore();
            }
        };
        /**
         * Starts new round.  Updates which team turn it is, starts timer,
         * retrieves next word.
         */
        $scope.startNewRound = function(){
            turnManagerObj = turnManager();
            playTimer.startTimer();
            incrementScore();
            wordPlayManagerObj.getNextWord();
        };
        /**
         * Wrapper for call nextTurn() 
         */
        var endTurnTasks = function(){
            turnManagerObj.nextTurn();
        };
        playTimer.timerEndCallback(endTurnTasks);
        /**
         * Class that manages the words that get displayed randomly
         * @return {Objects} API to access the wordPlayManager class
         */
        function wordPlayManager(){
            var playWordSet = [];
            var liveObjectView = [];
            var initialWordSet;
            var categoryList;
            /**
             * Retrieves the words from a given collection from the DB.  Provides
             * a promise of when the words are retrieved.
             * @return {Promise} When resolved, signifies when words have been retrieved.
             */
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
            /**
             * Loads the array of words to be shown 
             * @param  {Objects} words All the words contained in a category
             */
            function loadWordSet(words){
                playWordSet = [];
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
            /**
             * Resets the live view of the flash cards so that they contain
             * empty strings
             */
            function resetLiveView(){
                liveObjectView = [
                    {word: '', definition: '', index: 1},
                    {word: '', definition: '', index: 0},
                    {word: '', definition: '', index: 2}
                ];
            }
            /**
             * Updates the live view of the flash cards shown
             * @param  {String} newWord The newly retrieved word from the array
             */
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
            }
            /**
             * Calculates a random word index from the word array and removes it from
             * the word array
             */
            function calcIndexAndInsertWord(){
                var calcIndex = Math.round((playWordSet.length - 1) * Math.random());
                updateLiveView(playWordSet[calcIndex]);
                playWordSet.splice(calcIndex, 1);
            }
            /**
             * Updates a single scope (bound to view) word and definition
             * @param  {Array} liveObject        Array of words/defintion objects 
             * @param  {Number} liveObjectElement Index of words/definition object
             */
            function updateOneScopeItem(liveObject, liveObjectElement){
                var index = liveObject[liveObjectElement].index;
                var scopeWordKey = 'word' + index;
                var scopeDefinitionKey = 'definition' + index;
                $scope[scopeWordKey] = liveObject[liveObjectElement].word;
                $scope[scopeDefinitionKey] = liveObject[liveObjectElement].definition;
            }
            /**
             * Updates all the word/defintions in the live view
             */
            function updateAllScopeItems(){
                for (var idx = 0; idx<liveObjectView.length; idx++){
                    updateOneScopeItem(liveObjectView, liveObjectView[idx].index);
                }
            }
            /**
             * Resets the word array to be selected and refreshes the live view
             * to starting positions and values
             */
            function resetWordGroup(){
                $rootScope.$broadcast('resetToInitial');
                resetLiveView();
                var gatherWordsPromise = gatherWords();
                gatherWordsPromise.then(function() {
                    calcIndexAndInsertWord();
                    calcIndexAndInsertWord();
                    calcIndexAndInsertWord();
                    $timeout(function () {
                        updateAllScopeItems();
                    }, 0);
                })
            }
            /**
             * Gets next word in the live view and triggers animations in directives.
             */
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
        /**
         * Class that manages the score of each team
         * @return {Objects} API to access the scoreManager class
         */
        function scoreManager(){
            var initialScore = [0,0];
            var scoreSync = autoSyncType('scores', initialScore);

            return{
                /**
                 * Increments currently selected team score
                 * @param  {Number} team team number
                 */
                incrementTeam: function(team){
                    var newValue = scoreSync.getValue(team);
                    newValue += 1;
                    scoreSync.setValue(team, newValue);
                },
                /** 
                 * Decrements the currently selected team
                 * @param  {Number} team team number
                 */
                decrementTeam: function(team){
                    if (scoreSync.getValue(team) > 0) {
                        var newValue = scoreSync.getValue(team);
                        newValue -= 1;
                        scoreSync.setValue(team, newValue);
                    }
                },
                /**
                 * Resets each team's score to 0
                 */
                resetScores: function(){
                    var names = scoreSync.getIndex();
                    names.forEach(function(name){
                        scoreSync.setValue(name, 0);
                    });
                }
            }
        }
        /**
         * Turn manager that keeps track of which team is active
         * @return {Objects} API to access the turnManager class
         */
        function turnManager(){
            var initialTurnState = [true, false];
            var turnSync = autoSyncType('turns', initialTurnState);
            var teamNames = turnSync.getIndex();
            /**
             * Resets the turn to team 0
             * @return {[type]} [description]
             */
            var resetTurn = function(){
                teamNames.forEach(function(name){
                    if (name === 'team1') {
                        turnSync.setValue(name, true);
                    } else {
                        turnSync.setValue(name, false);
                    }
                });
            };
            /**
             * Increments team index and wrap back to the first team if needed
             */
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
            /**
             * Accessor to get which team is active
             * @return {String} active team string (i.e., 'team0')
             */
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
        /**
         * Manages timer functions and state variables
         * @return {Object} API to control timer
         */
        function TimerClass(){
            var MAX_PRE_COUNT = 4;
            var time = 0;
            var preCount = MAX_PRE_COUNT;
            var soundEnabled = localStorageWrapper.getEnableSound();
            var timerCancelled = false;
            var timerEndCallback = function(){};
            var beep = new Howl({
                urls: ['media/audio/beep-08b.mp3']
            });
            var buzzer = new Howl({
                urls: ['media/audio/008664315-buzzer.mp3']
            });
            var isPlayActive = false;
            /**
             * Main function that decrements timer to 0.  Decrements faster
             * if timer approaching 0.  Can be cancelled.
             */
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
                        else if (time > 5){
                            if (preCount === 0) {
                                beep.play();
                                preCount = 2;
                            }
                            else {
                                preCount -= 1;
                            }
                        }
                        else{
                            beep.play();
                        }
                    }
                    time -= 0.25;
                    $timeout(secondTick, 250);
                }
                else if(!timerCancelled){
                    if (soundEnabled) {
                        buzzer.play();
                    }
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
                /**
                 * Starts the timer
                 */
                startTimer: function(){
                    time = localStorageWrapper.getTimeLimit();
                    isPlayActive = true;
                    $timeout(secondTick, 1);
                },
                /**
                 * Cancels the timer
                 */
                cancelTimer: function(){
                    time = 0;
                    if (isPlayActive){
                        timerCancelled = true;
                    }
                },
                /**
                 * Enables/disables sound
                 * @param  {Boolean} isSoundEnabled enables disables sound
                 */
                enableSound: function(isSoundEnabled){
                    soundEnabled = isSoundEnabled;
                },
                /**
                 * Provides a way for external function to be called when 
                 * timer ends, like updating/resetting view elements
                 * @param  {Function} callback Function to be called when timer expires
                 * @return {[type]}            [description]
                 */
                timerEndCallback: function(callback){
                    timerEndCallback = callback;
                },
                /**
                 * Accessor to provide if timer is active
                 * @return {Boolean} true/false on whether timer is active or not
                 */
                isPlayActive: function(){
                    return isPlayActive;
                }
            }
        }
        /**
         * Provides a synching mechanism to the database whenever something changes 
         * on the scope.  Abstraction for synching scores or turns to the DB.
         * at all times.
         * @param  {[type]} type              [description]
         * @param  {[type]} initialStateArray [description]
         * @return {[type]}                   [description]
         */
        function autoSyncType(type, initialStateArray) {
            var firebaseUrl = 'https://blistering-fire-4858.firebaseio.com/' + user.id;
            var scoresDB = {};
            $scope[type] = {};
            var teamNames = [];
            var teamNameUrls = [];
            var teamRefArray = [];

            /**
             * Instantiate function object to get initial DB state and create one
             * if it doesn't already exist
             * @param  {Object} snapshot Object containing a snapshot of the team scores
             */
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
            /**
             * Gets score value from specified team name
             * @param  {String} name name of team
             * @return {Number}      score or turn stored on scope
             */
            function getValue(name){
                return $scope[type][name];
            }
            /**
             * Sets the score or turn value on scope and DB
             * @param {[type]} name     [description]
             * @param {[type]} newValue [description]
             */
            function setValue(name, newValue){
                $scope[type][name] = newValue;
                syncDB();
            }
            /**
             * Gets index of team names
             * @return {Array array of team names
             */
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
