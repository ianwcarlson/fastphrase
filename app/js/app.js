
var myApp =	angular.module('myApp', [
    'onsen.directives',
    'ngAnimate',
    'ngTouch',
    'angular-gestures',
    'controllerModule',
    'servicesModule',
    'loginServiceModule',
    'firebase',
    'LocalStorageModule',
    'loginControllerModule',
    'playControllerModule',
    'menuControllerModule',
    'ui.router',
    'directivesModule',
    'filtersModule',
    'optionsCtrlModule'
]);

myApp.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {


    $stateProvider
        .state('anon', {
            abstract: true,
            data: {
                access: 'anon'
            }
        })
        .state('anon.login', {
            url: "/login",
            templateUrl: "partials/login.html"
        })
        .state('anon.signup', {
            url: "/signup",
            templateUrl: "partials/signup.html"
        })
        .state('anon.resetPassword', {
            url: "/resetPassword",
            templateUrl: "partials/resetPassword.html"
        });

    $stateProvider
        .state('user', {
            abstract: true,
            data: {
                access: 'user'
            }
        })
        .state('user.collections', {
            url: "/collections?action&title",
            templateUrl: "partials/collections.html"
        })
        .state('user.play', {
            url: "/play",
            templateUrl: "partials/play.html"
        })
        .state('user.words', {
            url: "/words?action&title&rightButtonIcon",
            templateUrl: "partials/words.html"
        })
        .state('user.definitions', {
            url: "/definitions?action&title",
            templateUrl: "partials/definitions.html"
        })
        .state('user.settings', {
            url: "/settings?action&title",
            templateUrl: "partials/settings.html"
        });

    $urlRouterProvider.otherwise('login');
}]);

myApp.constant('appConstants', {

    firebaseMainUrl: 'https://blistering-fire-4858.firebaseio.com'

});

myApp.run(['$rootScope', '$timeout', '$state', '$stateParams', '$templateCache', 'loginService',
    function($rootScope, $timeout, $state, $stateParams, $templateCache, loginService) {

    var auth = loginService.getLoginAuthorization();

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){

        if (loginService.verifyUserFromLocalStorage() ||
            toState.data.access === 'anon') {
            // user and session valid
            //if ($rootScope.ons.navigator) {
                switch (toParams.action) {
                    case 'push':
                        $rootScope.ons.navigator.pushPage(toState.templateUrl, {
                            title: toParams.title, rightButtonIcon: toParams.rightButtonIcon
                        });
                        break;
                    case 'pop':
                        $rootScope.ons.navigator.popPage();
                        break;
                    default:
                        if ($rootScope.ons.slidingMenu) {
                            $rootScope.ons.slidingMenu.setAbovePage(toState.templateUrl);
                        }
                }
            //}
            //else{
                // this is a work-around for browser refresh on view page stack
                // for some reason $rootScope.ons.navigator isn't defined
                //$state.go('user.collections');
                //if ($rootScope.ons.slidingMenu) {
                //    $rootScope.ons.slidingMenu.setAbovePage('partials/collections.html');
                //}


            //}
            //$timeout(function () {
            //    $rootScope.$broadcast('updatePage');
            //}, 0);


            $rootScope.state = $state.current;
        }
        else{
            // user and/or session invalid
            // redirect to login page
            //var auth = loginService.getLoginAuthorization();
            //auth.logout();
            $state.go('anon.login');
            if ($rootScope.ons.slidingMenu) {
                $rootScope.ons.slidingMenu.setAbovePage('partials/login.html');
            }
        }
    });

    $rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams){
        console.log('stateNotFound');
    });

    $rootScope.$on('$stateChangeError',
        function(event, toState, toParams, fromState, fromParams, error){
        console.log('stateChangeError');
    });

    $rootScope.$on('$viewContentLoaded', function(){
        $templateCache.removeAll();
    });

    $rootScope.$on('$stateChangeStart', function(){
        //$rootScope.$broadcast('updatePage');
    });
}]);

