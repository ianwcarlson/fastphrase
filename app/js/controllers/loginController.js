(function(){
	'use strict';
	var loginControllerModule = angular.module('loginControllerModule', []);

    loginControllerModule.controller('loginController', [
        '$scope', 'loginService', '$state',
        function($scope, loginService, $state){

        var auth = loginService.getLoginAuthorization();

        // this will get call whenever login state changes
        var updateLoginStatus = function(){
            if (loginService.getLoginActive()){
                $state.go('collections', {action: '', title: ''});
            }
        };
        loginService.setLoginCallback(updateLoginStatus);
        // run the first time to see if token already valid
        updateLoginStatus();

        $scope.login = function(provider){
            auth.login(provider);
        }


    }]);

    loginControllerModule.controller('signupController', [
        '$scope', 'loginService', '$state',
        function($scope, loginService, $state){

            var auth = loginService.getLoginAuthorization();
            $scope.showFirst = true;
            $scope.emailInUse = false;

            $scope.submitEmail = function(){
                //$scope.showFirst = false;
                var autoGenPassword = loginService.generatePassword();
                auth.createUser($scope.signup.inputEmail, autoGenPassword, function(error, user){

                    if (!error){
                        auth.sendPasswordResetEmail($scope.signup.inputEmail, function(error, success){
                            if (!error){
                                $scope.showFirst = false;
                            }
                            else{
                                alert(error);
                            }
                        })
                    }
                    else{
                        if (error.code === 'EMAIL_TAKEN')
                        $scope.emailIn = true;
                    }
                })
            }

            $scope.setNewPassword = function(){
                auth.changePassword($scope.signup.inputEmail, $scope.tempPassword,
                    $scope.pw2, function(error, success){

                    if (!error){
                        console.log('Password changed successfully');
                    }
                    else{
                        alert('login successful');
                        $state.go('login');
                    }
                })
            };

            function authErrorClass(scopeVariable, error){
                var nonUserError = false;

                switch(error.code){
                    case ('EMAIL_TAKEN'):
                        $scope[scopeVariable] = 'Email already in use.';
                        break;
                    case ('INVALID_EMAIL'):
                        $scope[scopeVariable] = 'Email invalid.';
                        break;
                    case ('AUTHENTICATION_DISABLE'):
                        console.log('Authentication Error: The specified authentication type is not enabled for this Firebase.');
                        nonUserError = true;
                        break;
                    case ('INVALID_FIREBASE'):
                        console.log('Authentication Error: Invalid Firebase specified.');
                        nonUserError = true;
                        break;
                    case ('INVALID_ORIGIN'):
                        console.log('Authentication Error: Invalid origin');
                        nonUserError = true;
                        break;
                    case ('INVALID_PASSWORD'):
                        $scope[scopeVariable] = 'Username or password incorrect';
                        break;
                    case ('INVALID_USER'):
                        $scope[scopeVariable] = 'Username or password incorrect';
                        break;
                    case ('UNKNOWN_ERROR'):
                        console.log('Authentication Error: Unknown error occurred');
                        nonUserError = true;
                        break;
                    case ('USER_DENIED'):
                        console.log('Authentication Error: User denied');
                        nonUserError = true;
                        break;
                    default:
                        console.log('Authentication Error: ', error);
                        nonUserError = true;
                        break;
                }
                if (nonUserError){
                    $scope[scopeVariable] = 'Authentication error occurred: contact support@fastphrase.com';
                }
            }
        }
    ])



})();
