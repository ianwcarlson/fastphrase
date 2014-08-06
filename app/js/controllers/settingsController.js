

angular.module('optionsCtrlModule', [])
    .controller('optionsCtrl', ['$scope','localStorageService', 'appConstants', 'localStorageWrapper',
        function($scope, localStorageService, appConstants, localStorageWrapper) {
            'use strict';

            $scope.options = {};
            $scope.input = {
                //timeLimitSelect: {}
            };

            $scope.options.enableSound = localStorageWrapper.getEnableSound();
            $scope.options.playStudy = localStorageWrapper.getPlayEnable();

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
