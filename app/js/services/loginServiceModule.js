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
    /**
     * Initiates the login process with the Firebase API
     * @param  {String} provider  (e.g., 'facebook', 'password')
     * @param  {Object} loginInfo contains 'email' and 'password' properties 
     * if that provider is selected
     * @return {Promise object} when resolved, the promise will return the user object
     * contain information about the user
     */
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
                preferRedirect: false
            };
        }
        var providerString = 'provider ' + provider;
        //alert(providerString);
        auth.login(provider,options);
        return deferred.promise;
    };
    /**
     * logs out via the Firebase API
     */
    var logout = function(){
        var chatRef = new Firebase(appConstants.firebaseMainUrl);
        var auth = FirebaseSimpleLogin(chatRef, function(error, user) {});
        auth.logout();
    };
    /**
     * Helper method that calls each callback from an array.  This is used
     * for assigning custom callbacks when the user has logged in. 
     * @param  {array} callbackArray array of functions to call
     */
    function callEachCallback(callbackArray){
        callbackArray.forEach(function(callback){
            if (angular.isDefined(callback) && typeof callback === 'function') {
                callback();
            }
        })
    }
    /**
     * Generates a random alpha-numeric password when the user
     * resets their password or needs to generate a new one
     * @return {[type]} [description]
     */
    function generatePassword () {
        var possibleChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?_-';
        var password = '';
        for(var i = 0; i < 16; i += 1) {
            password+=possibleChars[ Math.floor(Math.random()*possibleChars.length)]
        }
        return password;
    }
    /**
     * Translates the error codes into a string
     * @param  {Object} error object containing 'error' property
     * @return {String} error string
     */
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
    /**
     * Checks to see if user oauth token is stored in localstorage
     * @return {Boolean} true/false if user is currenlty stored
     */
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
    /**
     * Stores user information into local storage
     * @param {String} userID user identification
     */
    function setUserInfoToLocalStorage(userID){
        if (localStorageService.isSupported){
            var date = new Date();
            var EpochSeconds = date.getTime()/1000;
            localStorageService.set('userID', angular.toJson(userID));
            localStorageService.set('tokenCreationTime', EpochSeconds);
        }
    }

    return{
        /**
         * Assign a custom callback that gets called when the user logs in
         * @param {Function} callback custom function
         */
        setLoginCallback: function(callback){
            callbackArray.push(callback);
        },
        /**
         * External way of forcing all the login callbacks to trigger. Needed
         * this because of enabling/disable read-only mode
         * @param {Boolean} newLoginStatus
         */
        setLoginActive: function(newLoginStatus){
            loginActive = newLoginStatus;
            callEachCallback(callbackArray);
        },
        /**
         * Gets the active login status
         * @return {Boolean} 
         */
        getLoginActive: function(){
            return loginActive;
        },
        /**
         * Sets the current user, which gets used during login
         * @param {String} newUser 
         */
        setUser: function(newUser){
            user = newUser;
        },
        /**
         * Gets the current user
         * @return {String} user identification
         */
        getUser: function(){
            return userID;
        },
        login: login,
        logout: logout,
        /**
         * Sets the global login active status
         * @param {Boolean} newValue
         */
        setGlobalLoginActive: function(newValue){
            globalLoginActive = newValue;
        },
        generatePassword: generatePassword,
        getAuthError: authError,
        /**
         * Gets the login error message
         * @return {String} error message
         */
        getErrorMessage: function(){
            return errorMsg;
        },
        verifyUserFromLocalStorage: verifyUserFromLocalStorage,
        setUserInfoToLocalStorage: setUserInfoToLocalStorage
    }
}]);

