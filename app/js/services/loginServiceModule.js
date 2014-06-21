var loginServiceModule = angular.module('loginServiceModule', []);

loginServiceModule.factory('loginService', function(){
    var loginActive = false;
    var userID = null;
    var callbackArray = [];
    var chatRef = new Firebase('https://blistering-fire-4858.firebaseio.com');
    var auth = new FirebaseSimpleLogin(chatRef, function(error, user) {
        if (error) {
            loginActive = false;
            // an error occurred while attempting login
            alert(error.message);
            alert(error.code);
        } else if (user) {
            userID = user;
            loginActive = true;
            callEachCallback(callbackArray);
            // user authenticated with Firebase
            //alert('User ID: ' + user.uid + ', Provider: ' + user.provider);

        } else {
            loginActive = false;
            callEachCallback(callbackArray);
            // user is logged out
        }
    });

    function callEachCallback(callbackArray){
        callbackArray.forEach(function(callback){
            callback();
        })
    }

    function generatePassword () {
        var possibleChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?_-';
        var password = '';
        for(var i = 0; i < 16; i += 1) {
            password+=possibleChars[ Math.floor(Math.random()*possibleChars.length)]
        }
        return password;
    }

    return{
        setLoginCallback: function(callback){
            callbackArray.push(callback);
        },
        getLoginActive: function(){
            return loginActive;
        },
        getLoginAuthorization: function(){
            return auth;
        },
        getUser: function(){
            return userID;
        },
        generatePassword: generatePassword
    }
});

