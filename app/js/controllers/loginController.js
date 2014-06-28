(function(){
	'use strict';
	var loginControllerModule = angular.module('loginControllerModule', []);

    loginControllerModule.controller('loginController', [
        '$scope', 'loginService', '$state',
        function($scope, loginService, $state){

        var auth = loginService.getLoginAuthorization();
        $scope.login = {};

        // this will get call whenever login state changes
        var updateLoginStatus = function(){
            if (loginService.getLoginActive()){
                $state.go('collections', {
                    action: '',
                    title: '',
                    rightButtonIcon: 'fa fa-lg fa-pencil'
                });
            }
            else{
                $scope.login.loginError = loginService.getErrorMessage();
                $scope.$apply();
            }
        };
        loginService.setLoginCallback(updateLoginStatus);
        // run the first time to see if token already valid
        updateLoginStatus();

        $scope.login = function(provider){
            auth.login(provider,{
                email: $scope.login.username,
                password: $scope.login.password
            })
        };

        $scope.keyPressed = function(ev){
            if (ev.which==13){
                $scope.login('password');
            }
        };

    }]);

    loginControllerModule.controller('signupController', [
        '$scope', 'loginService', '$state', '$timeout',
        function($scope, loginService, $state, $timeout){

            var auth = loginService.getLoginAuthorization();
            $scope.showFirst = true;

            $scope.submitEmail = function(){
                //$scope.showFirst = false;
                var autoGenPassword = loginService.generatePassword();
                auth.createUser($scope.signup.inputEmail, autoGenPassword, function(error, user){

                    if (!error){
                        auth.sendPasswordResetEmail($scope.signup.inputEmail, function(error, success){
                            if (!error){
                                $scope.showFirst = false;
                                $scope.$apply();
                            }
                            else{
                                alert(error);
                            }
                        })
                    }
                    else{
                        $scope.emailError = loginService.getAuthError(error);
                        $scope.$apply();
                    }
                })
            };

            $scope.setNewPassword = function(){
                auth.changePassword($scope.signup.inputEmail, $scope.tempPassword,
                    $scope.pw2, function(error, success){

                    if (!error){
                        $state.go('login');
                    }
                    else{
                        $scope.passwordError = loginService.getAuthError(error);
                        $scope.$apply();
                    }
                })
            };
        }
    ]);

    loginControllerModule.controller('passwordResetController', [
        '$scope', 'loginService', '$state', '$timeout',
        function($scope, loginService, $state, $timeout){

            var auth = loginService.getLoginAuthorization();
            $scope.showFirst = true;

            $scope.submitEmail = function(){

                auth.sendPasswordResetEmail($scope.signup.inputEmail, function(error, success){
                    if (!error){
                        $scope.showFirst = false;
                        $scope.$apply();
                    }
                    else{
                        $scope.passwordResetError = loginService.getAuthError(error);
                        $scope.$apply();
                    }
                })
            };
            // TODO consolidate reset password and signup similarities
            $scope.setNewPassword = function(){
                auth.changePassword($scope.signup.inputEmail, $scope.tempPassword,
                    $scope.pw2, function(error, success){

                        if (!error){
                            $state.go('login');
                        }
                        else{
                            $scope.passwordError = loginService.getAuthError(error);
                            $scope.$apply();
                        }
                    })
            };
        }])

})();
