var loginServiceModule = angular.module('loginServiceModule', []);

loginServiceModule.factory('loginService', ['appConstants', 'localStorageService', '$q',
    function(appConstants, localStorageService, $q){

    var globalLoginActive = true;
    var validTokenExpireTimeSecs = 3600;
    var loginActive = false;
    var userID = null;
    var tokenCreationTime = 0;
    var callbackArray = [];
    var errorMsg = '';
    var user = null;

    var login = function(provider, loginInfo){
        var deferred = $q.defer();
        var loginEmail = loginInfo.email || 'default';
        var loginPassword = loginInfo.password || 'default';
        var firebaseUrl = appConstants.firebaseMainUrl;
        var chatRef = new Firebase(firebaseUrl);
        var auth = FirebaseSimpleLogin(chatRef, function(error, user) {
            if (error) {
                errorMsg = authError(error);
                deferred.reject();
            } else if (user) {
                deferred.resolve(user);
            } else {
                // user is logged out
            }
        });

        var options = {};
        if (provider==='password') {
            options = {
                email: loginEmail,
                password: loginPassword
            };
        } else {
            options = {
                //rememberMe: true,
                preferRedirect: true
            };
        }
        var providerString = 'provider ' + provider;
        //alert(providerString);
        auth.login(provider,options);
        return deferred.promise;
    };
    var logout = function(){
        var chatRef = new Firebase(appConstants.firebaseMainUrl);
        var auth = FirebaseSimpleLogin(chatRef, function(error, user) {});
        auth.logout();
    };

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
                    errorMsg = 'Authentication Error: ' + error.code;
                    alert(errorMsg);
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
        setLoginActive: function(newLoginStatus){
            loginActive = newLoginStatus;
            callEachCallback(callbackArray);
        },
        getLoginActive: function(){
            return loginActive;
        },
        //getLoginAuthorization: function(){
        //    return auth;
        //},
        setUser: function(newUser){
            user = newUser;
        },
        getUser: function(){
            return userID;
        },
        login: login,
        logout: logout,
        setGlobalLoginActive: function(newValue){
            globalLoginActive = newValue;
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

