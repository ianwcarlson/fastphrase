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
            var prevXClassName = '';
            var newXClassName = '';
            var dragXStartPosition;

            var flipXStartPosition;
            var flipAngle = 0;
            //addFlipClass(0);

            scope.$on('triggerNextWord', function(){

                prevXClassName = 'slidingCard' + styleLeft.toString();

                styleLeft = (styleLeft <= -180) ? (220) : (styleLeft -=200);

                modifyElementClass(prevXClassName, styleLeft);
            });

            scope.$on('resetToInitial', function(){
                prevXClassName = 'slidingCard' + styleLeft.toString();
                styleLeft = Number(attrs.initialPosition);

                modifyElementClass(prevXClassName, styleLeft);
            });

            function modifyElementClass(prevClass, newStyleLeft){
                newXClassName = 'slidingCard' + newStyleLeft.toString();
                element.removeClass(prevClass + ' animated');
                element.addClass(newXClassName + ' animated');
            }

            scope.dragEvent = function(event){
                var newXPosition  = dragXStartPosition + event.gesture.deltaX;
                //element[0].style.webkitTransform = "translateX(" + newXPosition + 'px)';

                var newYPosition = flipAngle + event.gesture.deltaY;
                newYPosition = wrapAngle(newYPosition);
                var transformString = 'translateX(' + newXPosition + 'px) ' +
                    'rotateY(' + newYPosition.toString() + 'deg)';
                element[0].style.webkitTransform = transformString;
                console.log('transformString: ', transformString);
            };

            scope.dragStart = function(event){
                dragXStartPosition = element[0].offsetLeft;
                var transformString = 'translateX(' + dragXStartPosition + 'px) ' +
                    'rotateY(' + flipAngle + 'deg)';
                element[0].style.webkitTransform = transformString;
                console.log('transformStringStart: ', transformString);

                element.removeClass(newXClassName + ' animated');

                removeFlipClass(flipAngle);

            };

            scope.dragEnd = function(event){
                element[0].style.webkitTransform = '';
                element.addClass(newXClassName + ' animated');

                addFlipClass(flipAngle);

            };

            scope.flipCard = function(){
                element[0].classList.toggle("flip");


                /*
                if (flipAngle === 0){
                    removeFlipClass(0);
                    addFlipClass(180);
                    flipAngle = 180;
                }
                else{
                    removeFlipClass(180)
                    addFlipClass(0);
                    flipAngle = 0;
                }
                */
            };

            function addFlipClass(angle){
                // might need to check if class already exists
                //element.addClass('flipCard-' + angle + ' animated');
            }

            function removeFlipClass(angle){
                //element.removeClass('flipCard-' + angle + ' animated');
            }

            function wrapAngle(angle){
                /*
                              /\  |   /\
                             / \  |  /  \
                            /   \ | /    \
                           /     \|/      \
                */
                // trying to achieve a saw-function that never goes negative
                var newAngle = Math.abs(angle);
                var mod180 = newAngle % 180;
                var quotient = Math.floor(newAngle/180);
                var evenOdd = quotient % 2;

                if (evenOdd === 1){
                    // odd number should decrease
                    mod180 = 180 - mod180;
                }

                return mod180;
            }


        }
    }
}]);

directivesModule.directive('cardDivHeightCalc', function(){
    return{
        restrict: 'A',
        link: function(scope, element, attrs){

            setHeight();

            window.addEventListener('resize', setHeight);

            function setHeight(){
                var windowHeight = window.innerHeight;
                var topHalfHeight = 270;
                var bottomBarHeight = 64;
                var bottomHalfHeight = windowHeight - topHalfHeight - bottomBarHeight;

                if (bottomHalfHeight < 100){
                    bottomHalfHeight = 100;
                }
                element[0].style.height = bottomHalfHeight + 'px';
            }
        }
    }
});

directivesModule.directive('dynamicWidth', function(){
    return{
        restrict: 'A',
        link: function(scope, element, attrs){

            setWindowSize();

            window.addEventListener('resize', setWindowSize);

            function setWindowSize() {
                var windowWidth = window.innerWidth;
                var marginWidth = Number(attrs.marginWidth) || 20;

                var unconstrainedWidth = windowWidth - marginWidth;
                var containerWidth;

                if (unconstrainedWidth > 730) {
                    containerWidth = 720;
                } else {
                    containerWidth = unconstrainedWidth;
                }

                element[0].style.width = containerWidth + 'px';
            }
        }
    }
});


