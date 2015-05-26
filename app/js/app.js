
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
/**
 * Master app router and manages page view stack
 */
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
/**
 * The onsen library being used has a rather complication nested scope structure.  Needed to
 * access global methods it provides to overrides some of the built in functinality.
 */
myApp.run(['$rootScope', '$timeout', '$state', '$stateParams', '$templateCache', 'loginService',
    function($rootScope, $timeout, $state, $stateParams, $templateCache, loginService) {

    //var auth = loginService.getLoginAuthorization();

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){

        if (loginService.verifyUserFromLocalStorage() ||
            toState.data.access === 'anon') {
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
                if (fromState.name==='user.settings'){
                    loginService.setGlobalLoginActive(true);
                }
                else if (toState.name==='user.settings'){
                    loginService.setGlobalLoginActive(false);
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
            // Since onsen doesn't rerun each controller when pages are
            // pushed and popped, need to fire event to rerun controller
            // initialization functions; specifically, the edit icon needs
            // to be re-binded to delete elements
            $timeout(function () {
                $rootScope.$broadcast('updatePage');
            }, 0);


            $rootScope.state = $state.current;
        }
        else{
            // user and/or session invalid
            // redirect to login page
            //var auth = loginService.getLoginAuthorization();
            //auth.logout();
            //alert('redirect to login');
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

