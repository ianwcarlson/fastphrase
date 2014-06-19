var directivesModule = angular.module('directivesModule', []);

directivesModule.directive('playSound', function(){
    return{
        restrict: 'E',
        template: "<audio id='countDownBeep' src='media/audio/beep-08b.mp3' preload='auto'></audio>" +
            "<a href='javascript:play_single_sound();'></a>",
        link: function(scope, element){


        }

    }
});


