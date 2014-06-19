var loginServiceModule = angular.module('loginServiceModule', []);

loginServiceModule.factory('loginService', function(){
    var loginActive = false;
    var statusUpdateCallback = function(){};

    return{
        setLoginCallback: function(callback){
            statusUpdateCallback = callback;
        },
        getLoginActive: function(){
            return loginActive;
        },
        setLoginActive: function(isLoginActive){
            loginActive = isLoginActive;
            statusUpdateCallback();
        }


    }
});

