(function(){
	'use strict';
	var loginControllerModule = angular.module('loginControllerModule', []);

    loginControllerModule.controller('loginController', [
        '$scope', 'loginService', '$state', 'appConstants',
        function($scope, loginService, $state, appConstants){

        $scope.login = {};

        function transitionState(user){
            loginService.setUser(user);
            loginService.setLoginActive(true);
            loginService.setUserInfoToLocalStorage(user);
            $state.go('user.collections', {
                action: '',
                title: '',
                rightButtonIcon: 'fa fa-lg fa-pencil'
            });
        }

        var firebaseUrl = appConstants.firebaseMainUrl;
        var chatRef = new Firebase(firebaseUrl);
        var auth = FirebaseSimpleLogin(chatRef, function(error, user) {
            if (error) {
                alert('user denied');
            } else if (user) {
                if ($state.current.name === 'anon.login') {
                    transitionState(user);
                    auth.logout();
                }
            } else {
                //alert('user logged out');
            }
        });

        $scope.login = function(provider){
            var options = {};
            if (provider==='password') {
                options = {
                    email: $scope.login.username,
                    password: $scope.login.password
                };
            } else {
                options = {
                    preferRedirect: true
                };
            }

            auth.login(provider,options);
        };

        $scope.keyPressed = function(ev){
            if (ev.which==13){
                $scope.login('password');
            }
        };

    }]);

    loginControllerModule.controller('signupController', [
        '$scope', 'loginService', '$state', '$timeout', 'appConstants',
        function($scope, loginService, $state, $timeout, appConstants){

            var firebaseUrl = appConstants.firebaseMainUrl;
            var chatRef = new Firebase(firebaseUrl);
            var auth = FirebaseSimpleLogin(chatRef, function(error, user) {});
            $scope.showFirst = true;

            $scope.submitEmail = function(){
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
        '$scope', 'loginService', '$state', '$timeout', 'appConstants',
        function($scope, loginService, $state, $timeout, appConstants){

            var firebaseUrl = appConstants.firebaseMainUrl;
            var chatRef = new Firebase(firebaseUrl);
            var auth = FirebaseSimpleLogin(chatRef, function(error, user) {});
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
