
'use strict';


//Declare mespeak
meSpeak.loadConfig("/js/mespeak/mespeak_config.json");
meSpeak.loadVoice("/js/mespeak/voices/en/en-us.json");
var meSpeak_options = {
	amplitude: 10,
	wordgap: 10,
	pitch: 50,
	speed: 140,
	variant: 'm7'
};

// Declare app level module which depends on filters, and services
angular.module('Main', [
	'ngRoute',
	'ui.event',
	'ui.bootstrap',
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
