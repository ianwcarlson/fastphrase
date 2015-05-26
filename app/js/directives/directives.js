var directivesModule = angular.module('directivesModule', []);
/**
 * Creates a DOM element that loads an audio file
 */
directivesModule.directive('playSound', 
    function(){
        return{
            restrict: 'E',
            template: "<audio id='countDownBeep' src='media/audio/beep-08b.mp3' preload='auto'></audio>" +
                "<a href='javascript:play_single_sound();'></a>",
            link: function(scope, element){}
        }
    }
);
/**
 * Provides mechanism to live check password validity
 */
directivesModule.directive('pwCheck', [function(){
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.pwCheck;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    ctrl.$setValidity('pwmatch', elem.val() === $(firstPassword).val());
                });
            });
        }
    }
}]);
/**
 * Wrapper to manage the edit icon that gets pressed when the user wants to edit
 * the view.  Also binds to specified callback on scope
 */
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
            }
            findIconAndInvokeCallback();
            scope.$on('updatePage', findIconAndInvokeCallback);
        }
    }
}]);
/**
 * Manages the flash card animation.  The cards can flip or be swiped to the left
 * CSS animations
 */
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
            var dragStart = false;

            scope.$on('triggerNextWord', function(){
                prevXClassName = 'slidingCard' + styleLeft.toString();

                styleLeft = (styleLeft <= -190) ? (210) : (styleLeft -=200);
                if (styleLeft === 210){
                    element.removeClass('flip');
                }
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

            function showHideCard(element){
                var childElemContents = element.children().children()[0].children[0].innerHTML
                if (childElemContents === ''){
                    element.addClass('hide-card');
                }
                else{
                    element.removeClass('hide-card');
                }
            }
            scope.flipCard = function(){
                element[0].classList.toggle("flip");
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
/**
 * Provides view logic to calculate the div height of the card, since it's 
 * variable depending on the screen size
 */
directivesModule.directive('cardDivHeightCalc', function(){
    return{
        restrict: 'A',
        link: function(scope, element, attrs){

            setHeight();

            window.addEventListener('resize', setHeight);

            function setHeight(){
                var windowHeight = window.innerHeight;
                // need to determine height of div containing all the play elements
                var topHalfHeight = (scope.options.playEnable) ? 270 : 120;
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
/**
 * Provides view logic to calculate the width of the card, since it's 
 * variable depending on the screen size
 */
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
/**
 * Switches between the word and definition depending on which side of the
 * card is shown.
 */
directivesModule.directive("switch", [function() {
    return {
        restrict: "EA",
        replace: true,
        scope: {
            model: "=ngModel",
            changeExpr: "@ngChange",
            disabled: "@"
        },
        template: "<div class='switch' ng-class='{active: model}'><div class='switch-handle'></div></div>",
        link: function(scope, elem, attrs) {

            elem.on('click', function(){
                if (attrs.disabled == null) {
                    scope.model = !scope.model;
                    scope.$apply();

                    if (scope.changeExpr != null) {
                        scope.$parent.$eval(scope.changeExpr);
                    }
                }
            });

            elem.addClass('switch-transition-enabled');
        }
    };
}]);
/**
 * View logic to manages the width of the time limit select element based
 * on window size
 */
directivesModule.directive('timeLimitSelectWidth', [function(){
    return{
        restrict: 'A',
        link: function(scope, element, attrs){

            setWindowSize();

            window.addEventListener('resize', setWindowSize);

            function setWindowSize() {
                var windowWidth = window.innerWidth;
                var LEFT_TEXT_WIDTH = 111;
                var sliderWidth = windowWidth - LEFT_TEXT_WIDTH;
                element[0].style.width = sliderWidth + 'px';
            }
        }
    }
}]);
/**
 * View logic to dynamically size card text depending on screen size
 */
directivesModule.directive('cardTextWidth', [function(){
    return{
        restrict: 'A',
        link: function(scope, element, attrs){

            setWindowSize();

            window.addEventListener('resize', setWindowSize);
            scope.$on('triggerNextWord', setWindowSize);

            function setWindowSize() {
                // need to find the size of visible card and set text width to that
                var flipCards = document.getElementsByClassName('flip-container');
                // the third one always has full width
                var cardWidth = flipCards[2].offsetWidth;

                var textWidth = 0.8*cardWidth;
                element[0].style.width = textWidth + 'px';
            }
        }
    }
}]);
/**
 * View logic to dynamically set card text height
 */
directivesModule.directive('cardTextHeight', [
    '$timeout', function($timeout){
    return{
        restrict: 'A',
        link: function(scope, element, attrs){

            setWindowSize();

            window.addEventListener('resize', setWindowSize);
            scope.$on('triggerNextWord', setWindowSize);

            function setWindowSize() {
                // need to find the height of the text which is a child of this node
                var cardText = element.children();
                // set the current element to that height

                var textHeight = cardText[0].offsetHeight;

                element[0].style.height = textHeight + 'px';
            }
        }
    }
}]);
/**
 * View logic to dynamically set text size based off card size
 */
directivesModule.directive('autoTextSize', [
    // auto size text to fit element
    '$timeout', function($timeout){
    return{
        restrict: 'A',
        link: function(scope, element, attrs){

            var fontSize= 30;
            var RIGHT_POSITION = 210;
            setTextSize();

            window.addEventListener('resize', setTextSize);
            scope.$on('triggerNextWord', setTextSize);
            function findParentPosition(element){
                var suffix = 0;
                parentClassArray = element.parentNode.parentNode.parentNode.classList;
                searchKey = 'slidingCard';
                for (var idx=0; idx<parentClassArray.length; idx++){
                    var arrayString = parentClassArray[idx];
                    var foundPos = arrayString.search(searchKey);
                    if (foundPos !== -1){
                        suffix = arrayString.substr(searchKey.length);
                        break;
                    }
                }
                return Number(suffix);
            }

            function setTextSize() {
                // need to find the size of visible card
                var flipCards = document.getElementsByClassName('flip-container');
                // the third one always has full width
                var cardWidth = flipCards[2].offsetWidth;
                var cardHeight = flipCards[2].offsetHeight;

                var clientWidth = element[0].scrollWidth;
                var clientHeight = element[0].scrollHeight;
                var ratio = clientWidth/clientHeight;
                var parentPos = findParentPosition(element[0]);
                if (parentPos === RIGHT_POSITION) {
                    if (clientWidth > cardWidth * 0.85 ||
                        clientHeight > cardHeight * 0.7) {

                        if (fontSize > 10) {
                            fontSize -= 6;
                            element[0].style.fontSize = fontSize + 'px';
                        }
                    }
                    else if (clientWidth < cardWidth * 0.4 ||
                        clientHeight < cardHeight * 0.4) {
                        if (fontSize < 30) {
                            fontSize += 6;
                            element[0].style.fontSize = fontSize + 'px';
                        }
                    }
                }
            }
        }
    };
}]);
/**
 * View logic to show/hide modal
 */
directivesModule.directive("modalHide", [function() {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {

            scope.$on('modalStateChange', function(event, newState){
                if (newState){
                    elem.addClass('modalhide');
                } else {
                    elem.removeClass('modalhide');
                }
            });
        }
    };
}]);
/**
 * Template wrapper for login snippet
 */
directivesModule.directive("loginSnippet", [function() {
    return {
        restrict: "E",
        scope: false,
        templateUrl: 'partials/loginSnippet.html'
    };
}]);
/**
 * View logic to dynamically set login height.  Still having problems with this
 * on different screen sizes
 */
directivesModule.directive("loginChildHeight", [function() {
    return {
        restrict: "A",
        link: function(scope, element) {
            window.addEventListener('resize', setHeight);
            scope.$watch('showLoginOverlay', setHeight);
            function setHeight(){
                var child = document.getElementsByClassName('modal-inner');
                var elemHeightString = child[0].clientHeight.toString() + 'px';
                element[0].style.height = elemHeightString;
            }
            setHeight();
        }
    };
}]);


