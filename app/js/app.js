
var myApp =	angular.module('myApp', [
    'onsen.directives',
    'ngAnimate',
    'controllerModule',
    'servicesModule',
    'loginServiceModule',
    'firebase',
    'loginControllerModule',
    'playControllerModule',
    'menuControllerModule',
    'ui.router',
    'directivesModule'
]);

myApp.config(function($stateProvider, $urlRouterProvider) {


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
});


myApp.run(function($rootScope, $timeout, $state, $stateParams, $templateCache) {
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
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
        $timeout(function(){
            $rootScope.$broadcast('updatePage');
        }, 0);


        $rootScope.state = $state.current;
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
});

