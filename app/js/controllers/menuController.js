(function(){
	'use strict';
	var menuControllerModule = angular.module('menuControllerModule', []);

    menuControllerModule.controller('menuController', [
        '$scope', 'loginService', function($scope, loginService){

        $scope.loginActive = false;
        var updateLoginStatus = function(){
            $scope.loginActive = loginService.getLoginActive();
            $scope.$apply();
        };
        loginService.setLoginCallback(updateLoginStatus);
        updateLoginStatus();

        var auth = loginService.getLoginAuthorization();
        $scope.logout = function(){
            auth.logout();
        }

    }]);


})();
