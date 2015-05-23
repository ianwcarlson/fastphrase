

angular.module('optionsCtrlModule', [])
    .controller('optionsCtrl', ['$scope','localStorageService', 'appConstants', 'localStorageWrapper',
        '$q', 'broadcastStateChange', 'loginService', '$timeout',
        function($scope, localStorageService, appConstants, localStorageWrapper,
        $q, broadcastStateChange, loginService, $timeout) {
            'use strict';

            $scope.options = {};
            $scope.input = {};
            // the loginChildHeight directive listens to this
            // because height property doesn't update until element
            // is actually visible
            $scope.showLoginOverlay = false;
            $scope.$on('modalStateChange', function(){
                $scope.showLoginOverlay = !$scope.showLoginOverlay;
            });

            /**
             * Method bound to the login button that initiates the login
             * process
             * @param {object} login provider via Firebase API (i.e., 
               Google/Facebook/Twitter oauth2 or email/password)
             */
            $scope.login = function(provider){
                var loginPromise = loginService.login(provider,{
                    email: $scope.login.username,
                    password: $scope.login.password
                });
                loginPromise.then(function(){
                    // need to added extra condition because outer function being fired
                    // twice on enter press. unsure why.
                    if ($scope.showLoginOverlay) {
                        $scope.options.enableReadOnly = !$scope.options.enableReadOnly;
                        localStorageWrapper.setReadOnly($scope.options.enableReadOnly);
                        broadcastStateChange.modalState(true);
                        $scope.login.password = '';
                    }
                }, function(){
                    broadcastStateChange.modalState(true);
                    alert('login failed');
                    // TODO make this more helpful
                });
            };

            /**
             * Enables the login modal
             */
            $scope.showLogin = function(){
                broadcastStateChange.modalState(false);
                loginService.logout();
            };

            /** 
             * Initiates password login method on enter key press
             * @param {object} event object that contains the pressed key code
             */
            $scope.keyPressed = function(ev){
                if (ev.which==13 && $scope.showLoginOverlay){
                    $scope.login('password');
                }
            };

            // Toggle methods to store the user settings in the local storage service
            $scope.options.enableSound = localStorageWrapper.getEnableSound();
            $scope.options.playStudy = localStorageWrapper.getPlayEnable();
            $scope.options.enableReadOnly = localStorageWrapper.getReadOnly();

            // String to number associations for time limit setting
            $scope.timeLimitOptions = [
                {name: '15 seconds',    value: 15},
                {name: '30 seconds',    value: 30},
                {name: '45 seconds',    value: 45},
                {name: '1 minute',      value: 60},
                {name: '1:30 minutes',  value: 90},
                {name: '2 minutes',     value: 120},
                {name: '2:30 minutes',  value: 150},
                {name: '3 minutes',     value: 180}
            ];

            /**
             * Updates the time limit value in the local storage service
             */
            $scope.updateTimeLimitValue = function(){
                if (angular.isDefined($scope.input.timeLimitSelect)){
                    localStorageWrapper.setTimeLimit($scope.input.timeLimitSelect.value);
                }
                var value = localStorageWrapper.getTimeLimit();
                for (var idx=0; idx<$scope.timeLimitOptions.length; idx++){
                    if ($scope.timeLimitOptions[idx].value === value){
                        $scope.input.timeLimitSelect = $scope.timeLimitOptions[idx];
                    }
                }
            };
            $scope.updateTimeLimitValue();

            /**
             * Updates user view to whether they are in game mode or study mode
             */
            var updateMode = function(){
                $scope.options.modeEnabled = ($scope.options.playStudy === true) ?
                    'Game mode': 'Study mode';
                $scope.$apply();
            };
            updateMode();

            /**
             * Update local storage service with sound and playstudy options.   
             */
            $scope.updateOptions = function(){
                localStorageWrapper.setEnableSound($scope.options.enableSound);
                localStorageWrapper.setPlayEnable($scope.options.playStudy);
                updateMode();
            };

        }
    ]);
