(function(){
	'use strict';
	var menuControllerModule = angular.module('menuControllerModule', []);

    menuControllerModule.controller('menuController', [
        '$scope', 'loginService', function($scope, loginService){

        $scope.loginActive = loginService.verifyUserFromLocalStorage();
        /**
         * Updates the login active view element from the login service
         */
        var updateLoginStatus = function(){
            $scope.loginActive = loginService.getLoginActive();
        };
        loginService.setLoginCallback(updateLoginStatus);
        /**
         * Initiates logout process and updates view element
         */
        $scope.logout = function(){
            loginService.logout();
            loginService.setLoginActive(false);
        }
    }]);
})();
