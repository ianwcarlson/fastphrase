
var myApp =	angular.module('myApp', [
    'onsen.directives',
    'ngAnimate',
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
    'filtersModule'
]);

myApp.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {


    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: "partials/login.html"
        })
        .state('signup', {
            url: "/signup",
            templateUrl: "partials/signup.html"
        })
        .state('resetPassword', {
            url: "/resetPassword",
            templateUrl: "partials/resetPassword.html"
        })
        .state('collections', {
            url: "/collections?action&title",
            templateUrl: "partials/collections.html"
        })
        .state('play', {
            url: "/play",
            templateUrl: "partials/play.html"
        })
        .state('words', {
            url: "/words?action&title&rightButtonIcon",
            templateUrl: "partials/words.html"
        })
        .state('definitions', {
            url: "/definitions?action&title",
            templateUrl: "partials/definitions.html"
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

        if (loginService.verifyUserFromLocalStorage()) {
            // user and session valid
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
            $state.go('login');
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

