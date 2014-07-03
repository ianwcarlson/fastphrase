var loginServiceModule = angular.module('loginServiceModule', []);

loginServiceModule.factory('loginService', ['appConstants', 'localStorageService',
    function(appConstants, localStorageService){

    var validTokenExpireTimeSecs = 3600;
    var loginActive = false;
    var userID = null;
    var tokenCreationTime = 0;
    var callbackArray = [];
    var errorMsg = '';
    var firebaseUrl = appConstants.firebaseMainUrl;
    var chatRef = new Firebase(firebaseUrl);
    var auth = new FirebaseSimpleLogin(chatRef, function(error, user) {
        if (error) {
            loginActive = false;
            // an error occurred while attempting login
            errorMsg = authError(error);
            callEachCallback(callbackArray);
        } else if (user) {
            userID = user;
            loginActive = true;
            setUserInfoToLocalStorage(user);
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
            if (angular.isDefined(callback) && typeof callback === 'function') {
                callback();
            }
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

    function authError(error){

        var nonUserError = false;
        var errorMessage = null;

        if (error) {
            switch (error.code) {
                case ('EMAIL_TAKEN'):
                    errorMessage = 'Email already in use.';
                    break;
                case ('INVALID_EMAIL'):
                    errorMessage = 'Email invalid.';
                    break;
                case ('AUTHENTICATION_DISABLE'):
                    alert('Authentication Error: The specified authentication type is not enabled for this Firebase.');
                    nonUserError = true;
                    break;
                case ('INVALID_FIREBASE'):
                    alert('Authentication Error: Invalid Firebase specified.');
                    nonUserError = true;
                    break;
                case ('INVALID_ORIGIN'):
                    alert('Authentication Error: Invalid origin');
                    nonUserError = true;
                    break;
                case ('INVALID_PASSWORD'):
                    errorMessage = 'Username or password incorrect';
                    break;
                case ('INVALID_USER'):
                    errorMessage = 'Username or password incorrect';
                    break;
                case ('UNKNOWN_ERROR'):
                    alert('Authentication Error: Unknown error occurred');
                    nonUserError = true;
                    break;
                case ('USER_DENIED'):
                    alert('Authentication Error: User denied');
                    nonUserError = true;
                    break;
                default:
                    alert('Authentication Error: ', error);
                    nonUserError = true;
                    break;
            }
            if (nonUserError) {
                errorMessage = 'Authentication error occurred: contact support@fastphrase.com';
            }
        }
        return errorMessage;
    }

    function verifyUserFromLocalStorage(){
        var loginActive = false;

        if (localStorageService.isSupported){
            userID = angular.fromJson(localStorageService.get('userID'));
            tokenCreationTime = localStorageService.get('tokenCreationTime');
            if (angular.isDefined(userID) && angular.isDefined(tokenCreationTime)){
                var date = new Date();
                var EpochSeconds = date.getTime()/1000;

                var expireTime = Number(tokenCreationTime) + validTokenExpireTimeSecs;
                if (EpochSeconds < expireTime){
                    // session not expired
                    loginActive = true;
                }
            }
        }

        return loginActive;
    }

    function setUserInfoToLocalStorage(userID){
        if (localStorageService.isSupported){
            var date = new Date();
            var EpochSeconds = date.getTime()/1000;
            localStorageService.set('userID', angular.toJson(userID));
            localStorageService.set('tokenCreationTime', EpochSeconds);
        }
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
        generatePassword: generatePassword,
        getAuthError: authError,
        getErrorMessage: function(){
            return errorMsg;
        },
        verifyUserFromLocalStorage: verifyUserFromLocalStorage,
        setUserInfoToLocalStorage: setUserInfoToLocalStorage
    }
}]);

