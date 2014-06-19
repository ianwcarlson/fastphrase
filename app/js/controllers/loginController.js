(function(){
	'use strict';
	var loginControllerModule = angular.module('loginControllerModule', []);

    loginControllerModule.controller('loginController', [
        '$scope', function($scope){

        var chatRef = new Firebase('https://blistering-fire-4858.firebaseio.com');
        var auth = new FirebaseSimpleLogin(chatRef, function(error, user) {
            if (error) {
                // an error occurred while attempting login
                alert(error);
            } else if (user) {
                // user authenticated with Firebase
                //alert('User ID: ' + user.uid + ', Provider: ' + user.provider);

            } else {
                // user is logged out
            }
        });

        $scope.login = function(provider){
            auth.login(provider);
        }


    }]);


})();
