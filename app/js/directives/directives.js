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

directivesModule.directive('pwCheck', [function(){
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.pwCheck;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    // console.info(elem.val() === $(firstPassword).val());
                    ctrl.$setValidity('pwmatch', elem.val() === $(firstPassword).val());
                });
            });
        }
    }
}]);

directivesModule.directive('editIcon', [function(){
    return{
        restrict: 'E',
        scope: {
            editIconCallback: '='
        },
        link: function(scope, element){
            function findIconAndInvokeCallback() {
                var elements = document.getElementsByClassName('right-section-icon');
                for (var item in elements){
                    elements[item].onclick = function() {
                        scope.editIconCallback();
                        scope.$apply();
                    }
                }
                //elements[0].onclick = function () {
                //    scope.editIconCallback();
                //    scope.$apply();
                //}
            }
            findIconAndInvokeCallback();
            scope.$on('updatePage', findIconAndInvokeCallback);
        }
    }
}]);

directivesModule.directive('animateWord', [function(){
    return{
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs){
            var styleLeft = Number(attrs.initialPosition);
            var prevClassName = '';
            var newClassName = '';
            console.log('styleLeft: ', styleLeft);
            scope.$on('triggerNextWord', function(){
            //    element.addClass('animated bounceInRight');
                prevClassName = 'slidingCard' + styleLeft.toString();

                styleLeft = (styleLeft <= -50) ? (150) : (styleLeft -=100);

                newClassName = 'slidingCard' + styleLeft.toString();
                element.removeClass(prevClassName + ' animated');
                element.addClass(newClassName + ' animated');
                //element[0].style.left = styleLeft + '%';
            });

            scope.$on('resetToInitial', function(){
                styleLeft = Number(attrs.initialPosition);
                element[0].style.left = styleLeft + '%';
            });
            //element.on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            //    element.removeClass('animated bounceInRight bounceOutLeft');
            //    element.addClass('animated bounceOutLeft')
            //});



        }
    }
}]);


