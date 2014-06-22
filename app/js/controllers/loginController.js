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

            $scope.submitEmail = function(){

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
                        alert('create User failed');
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
            }
        }
    ])



})();
