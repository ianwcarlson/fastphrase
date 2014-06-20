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


})();
