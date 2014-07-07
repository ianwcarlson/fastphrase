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
            var dragStartPosition;
            console.log('styleLeft: ', styleLeft);
            scope.$on('triggerNextWord', function(){

                prevClassName = 'slidingCard' + styleLeft.toString();

                styleLeft = (styleLeft <= -80) ? (120) : (styleLeft -=100);

                modifyElementClass(prevClassName, styleLeft);
            });

            scope.$on('resetToInitial', function(){
                prevClassName = 'slidingCard' + styleLeft.toString();
                styleLeft = Number(attrs.initialPosition);

                modifyElementClass(prevClassName, styleLeft);
            });

            function modifyElementClass(prevClass, newStyleLeft){
                newClassName = 'slidingCard' + newStyleLeft.toString();
                element.removeClass(prevClass + ' animated');
                element.addClass(newClassName + ' animated');
            }

            scope.dragEvent = function(event){
                var newPosition  = dragStartPosition + event.gesture.deltaX;
                element[0].style.webkitTransform = "translateX(" + newPosition + 'px)';
            };

            scope.dragStart = function(event){
                dragStartPosition = element[0].offsetLeft;
                element[0].style.webkitTransform = "translateX(" + dragStartPosition + 'px)';
                element.removeClass(newClassName + ' animated');

            };

            scope.dragEnd = function(event){
                element[0].style.webkitTransform = '';
                element.addClass(newClassName + ' animated');
            };


        }
    }
}]);

directivesModule.directive('cardDivHeightCalc', function(){
    return{
        restrict: 'A',
        link: function(scope, element, attrs){
            var windowHeight = window.innerHeight;
            var topHalfHeight = 280;
            var bottomBarHeight = 44;
            var bottomHalfHeight = windowHeight - topHalfHeight - bottomBarHeight;

            element[0].style.height = bottomHalfHeight + 'px';

        }
    }
});


