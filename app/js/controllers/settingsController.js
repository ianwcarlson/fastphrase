

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

            $scope.showLogin = function(){
                broadcastStateChange.modalState(false);
                loginService.logout();
            };

            $scope.keyPressed = function(ev){
                if (ev.which==13 && $scope.showLoginOverlay){
                    $scope.login('password');
                }
            };

            $scope.options.enableSound = localStorageWrapper.getEnableSound();
            $scope.options.playStudy = localStorageWrapper.getPlayEnable();
            $scope.options.enableReadOnly = localStorageWrapper.getReadOnly();

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

            var updateMode = function(){
                $scope.options.modeEnabled = ($scope.options.playStudy === true) ?
                    'Game mode': 'Study mode';
                $scope.$apply();
            };
            updateMode();

            //$scope.options.writeControl = optionsFactory.readOption('writeControl');
            //$scope.options.enableSound = optionsFactory.readOption('enableSound');
            //$scope.options.enableNotifications = optionsFactory.readOption('enableNotifications');

            $scope.updateOptions = function(){


                localStorageWrapper.setEnableSound($scope.options.enableSound);
                localStorageWrapper.setPlayEnable($scope.options.playStudy);
                updateMode();
                //optionsFactory.modifyOption('writeControl', $scope.writeControlEnable);
                //optionsFactory.modifyOption('iqDataPolling', $scope.iqDataPollingEnable);
                //optionsFactory.modifyOption('writeControl', $scope.options.writeControlEnable);
                //optionsFactory.modifyOption('mapAutoCenter', $scope.options.disableMapAutoCenter);
                //optionsFactory.modifyOption('showGradicules', $scope.options.showGradicules);
                //optionsFactory.modifyOption('showScale', $scope.options.showScale);
                //optionsFactory.modifyOption('writeControl', $scope.options.writeControl);
                //optionsFactory.modifyOption('enableSound', $scope.options.enableSound);
                //optionsFactory.modifyOption('enableNotifications', $scope.options.enableNotifications);
            };

        }
    ]);
