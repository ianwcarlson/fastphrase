
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
    'ui.router'
]);

myApp.config(function($stateProvider, $urlRouterProvider) {


    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: "login.html"
        })
        .state('collections', {
            url: "/collections?action&title",
            templateUrl: "collections.html"
        })
        .state('play', {
            //url: "/play",
            templateUrl: "play.html"
        })
        .state('words', {
            url: "/words?action&title",
            templateUrl: "words.html"
        })
        .state('definitions', {
            url: "/definitions?action&title",
            templateUrl: "definitions.html"
        });

    $urlRouterProvider.otherwise('login');
});


myApp.run(function($rootScope, $timeout, $state, $stateParams) {
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        switch (toParams.action) {
            case 'push':
                $rootScope.ons.navigator.pushPage(toState.templateUrl, {title: toParams.title});
                break;
            case 'pop':
                $rootScope.ons.navigator.popPage();
                break;
            default:
                if ($rootScope.ons.slidingMenu) {
                    $rootScope.ons.slidingMenu.setAbovePage(toState.templateUrl);
                }
        }

        //$timeout(function () {
            //if ($scope.ons.splitView) {
            //    $scope.ons.splitView.close();
            //}
        //}, 100);

        $rootScope.state = $state.current;
    });

    $rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams){
        console.log('stateNotFound');
    });

    $rootScope.$on('$stateChangeError',
        function(event, toState, toParams, fromState, fromParams, error){
        console.log('stateChangeError');
    });

    $rootScope.$on('$viewContentLoaded',
        function(event){
        console.log('content loaded');
    });
});

