(function(){
	'use strict';
	var loginControllerModule = angular.module('loginControllerModule', []);

    loginControllerModule.controller('loginController', [
        '$scope', 'loginService', '$state',
        function($scope, loginService, $state){

        $scope.login = {};

        $scope.login = function(provider){
            var loginPromise = loginService.login(provider,{
                email: $scope.login.username,
                password: $scope.login.password
            });
            loginPromise.then(function(user){
                $state.go('user.collections', {
                    action: '',
                    title: '',
                    rightButtonIcon: 'fa fa-lg fa-pencil'
                });
                loginService.setUser(user);
                loginService.setLoginActive(true);
                loginService.setUserInfoToLocalStorage(user);
                loginService.logoff();
            }, function(){
                $scope.login.loginError = loginService.getErrorMessage();
                //$scope.$apply();
                alert('login failed');
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
                        $state.go('anon.login');
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
                            $state.go('anon.login');
                        }
                        else{
                            $scope.passwordError = loginService.getAuthError(error);
                            $scope.$apply();
                        }
                    })
            };
        }])

})();
