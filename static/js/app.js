
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
})
.service('BufferdSpeach', function($rootScope) {
	this.speak_buffer = [];
	this.speak_semaphore = false;
	this.speak_disabled = false;
	var self = this;
	this.set_voice = function(voice) {
		self.voice = voice;
	};
	this.say = function(what_to_say, callback)
	{
		callback = callback || noop;
		if(what_to_say != false)
		{
			self.speak_buffer.push({say:what_to_say, callback:callback});
		}
		
		if(self.speak_semaphore == false)
		{
			self.speak_semaphore = true;
			self.speak_disabled = true;
			var item = self.speak_buffer.shift();
			var say = item.say;
			console.log('saying: '+say);
			var utterance = new SpeechSynthesisUtterance(say);
			if(self.voice) {
				utterance.voice = self.voice;
			}
			speechUtteranceChunker(utterance, 
			{
				chunkLength: 120
			}, function(event)
			{
				$rootScope.$apply(function()
				{
					self.speak_semaphore = false;
				});

				if(!self.speak_buffer.length) {
					$rootScope.$apply(function()
					{
						self.speak_disabled = false;
					}); 
				}
				if(self.speak_buffer.length > 0)
				{
					setTimeout(function()
					{
						self.say(false);
					}, 10);
				}
				item.callback();
			});

		}
	}
})
.service('WordDefinition', function($http, $rootScope) {
	this.get = function(word, callback)
	{
		callback = callback || noop;
		if($rootScope.hide_definition)
		{
			var url = 'http://api.wordnik.com/v4/word.json/'+word.toLowerCase()+'/definitions?api_key=27ee8c36f4fd2881b17060148560881d3d73eef5f87f1c26c';
			$http.get(url)
			.success(callback);
		}
		else
		{
			callback($rootScope.definitions);
		}
	}
});
