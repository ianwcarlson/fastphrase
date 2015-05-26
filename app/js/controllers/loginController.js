(function(){
	'use strict';
	var loginControllerModule = angular.module('loginControllerModule', []);
    /**
     * Controller assigned to the Login view
     */
    loginControllerModule.controller('loginController', [
        '$scope', 'loginService', '$state', 'appConstants',
        function($scope, loginService, $state, appConstants){

        $scope.login = {};
        /**
         * Signals the state manager to transition to the word collections
         * @param  {Object} user object containing information about the user logging in
         */
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
        /**
         * Utilizes the Firebase login service to verify current user
         * @param  {Object} error contains information pertaining to the error
         * @param  {Function} callback function that changes app view based on success
         * @return {Object} contains authorization information
         */
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
        /**
         * Triggers the authorization process of the appropriate type (ie oauth2 or email/password)
         * @param  {String} provider the authorization provider type
         */
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
        /**
         * Listens for key press and triggers login process if enter pressed
         * @param  {Object} ev object that contains information about what key was pressed
         */
        $scope.keyPressed = function(ev){
            if (ev.which==13){
                $scope.login('password');
            }
        };
    }]);
    /**
     * Controller assigned to the signup a new user view
     */
    loginControllerModule.controller('signupController', [
        '$scope', 'loginService', '$state', '$timeout', 'appConstants',
        function($scope, loginService, $state, $timeout, appConstants){
            var firebaseUrl = appConstants.firebaseMainUrl;
            var chatRef = new Firebase(firebaseUrl);
            var auth = FirebaseSimpleLogin(chatRef, function(error, user) {});
            $scope.showFirst = true;
            /**
             * Submits email information to create a new user via the Firebase API. 
             * Also sends an email to the user to create a new password
             */
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
            /**
             * Sets a new password using the Firebase API
             */
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
    /**
     * Controller assigned to password resetting view
     */
    loginControllerModule.controller('passwordResetController', [
        '$scope', 'loginService', '$state', '$timeout', 'appConstants',
        function($scope, loginService, $state, $timeout, appConstants){
            var firebaseUrl = appConstants.firebaseMainUrl;
            var chatRef = new Firebase(firebaseUrl);
            var auth = FirebaseSimpleLogin(chatRef, function(error, user) {});
            $scope.showFirst = true;
            /**
             * Submits email/username via Firebase API
             * @return {[type]} [description]
             */
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
            /**
             * Sets a new password via the Firebase API
             */
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
