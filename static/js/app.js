
'use strict';

// Declare app level module which depends on filters, and services
angular.module('Main', [
	'ngMaterial',
	'ngRoute',
	'ui.event',
	'MainAnimations',
	'MainControllers'
])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/start', {templateUrl: 'templates/start.html', controller: 'StartCtrl'});
	$routeProvider.when('/bad_browser', {templateUrl: 'templates/bad_browser.html', controller: 'BadBrowserCtrl'});
	$routeProvider.otherwise({redirectTo: '/start'});
}])
.directive('disableAnimation', function($animate){
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs){
            $attrs.$observe('disableAnimation', function(value){
                $animate.enabled(!value, $element);
            });
        }
    }
});
