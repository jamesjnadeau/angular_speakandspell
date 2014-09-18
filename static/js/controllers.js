'use strict';

/* Controllers */
angular.module('MainControllers', [])
.controller('StartCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) 
{
	$scope.word = 'Speak';
	$scope.word_id = 0;
	
	$scope.word_guess = '';
	$scope.answers = [];
	
	
	
	$scope.speak_buffer = [];
	$scope.speak_semaphore = false;
	$scope.speak_disabled = false;
	$scope.buffered_speak = function(what_to_say, callback)
	{
		callback = callback || noop;
		if(what_to_say != false)
		{
			$scope.speak_buffer.push({say:what_to_say, callback:callback});
		}
		
		if($scope.speak_semaphore == false)
		{
			$scope.speak_semaphore = true;
			$scope.speak_disabled = true;
			var item = $scope.speak_buffer.shift();
			var say = item.say;
			console.log('saying: '+say);
			
			var utterance = new SpeechSynthesisUtterance(say);
			//utterance.rate = .3;
			speechUtteranceChunker(utterance, 
			{
				chunkLength: 120
			}, function(event)
			{
				console.log('done');
				//console.log($scope.speak_buffer);
				$scope.$apply(function()
				{
					$scope.speak_disabled = false;
					$scope.speak_semaphore = false;
				});
				//console.log('speak_disabled');
				//console.log($scope.speak_disabled)
				
				
				if($scope.speak_buffer.length > 0)
				{
					setTimeout(function()
					{
						$scope.buffered_speak(false);
					}, 10);
				}
				item.callback();
			});

			
			
			
			//var msg = new SpeechSynthesisUtterance(say);
			//speechSynthesis.speak(msg);
			/*
			msg.onend = function(event)
			{
				console.log('done');
				//console.log($scope.speak_buffer);
				$scope.$apply(function()
				{
					$scope.speak_disabled = false;
					$scope.speak_semaphore = false;
				});
				//console.log('speak_disabled');
				//console.log($scope.speak_disabled)
				
				
				if($scope.speak_buffer.length > 0)
				{
					setTimeout(function()
					{
						$scope.buffered_speak(false);
					}, 10);
				}
				item.callback();
			};
			
			*/
			
			/*
			var all_done = function()
			{
				console.log('done');
				//console.log($scope.speak_buffer);
				$scope.$apply(function()
				{
					$scope.speak_disabled = false;
					$scope.speak_semaphore = false;
				});
				//console.log('speak_disabled');
				//console.log($scope.speak_disabled)
				
				
				if($scope.speak_buffer.length > 0)
				{
					setTimeout(function()
					{
						$scope.buffered_speak(false);
					}, 10);
				}
				item.callback();
			};
			
			var url = 'http://translate.google.com/translate_tts?ie=UTF-8&q='+encodeURIComponent(say)+'&tl=en&total=1';
			var audio = new Audio(url);
			console.log(url);
			audio.addEventListener('ended', all_done);
			audio.oncanplay = function()
			{
				audio.play();
			}
			*/
			/*
			meSpeak.speak(say, meSpeak_options,
			function()
			{
				console.log('done');
				//console.log($scope.speak_buffer);
				$scope.$apply(function()
				{
					$scope.speak_disabled = false;
					$scope.speak_semaphore = false;
				});
				//console.log('speak_disabled');
				//console.log($scope.speak_disabled)
				
				
				if($scope.speak_buffer.length > 0)
				{
					setTimeout(function()
					{
						$scope.buffered_speak(false);
					}, 10);
				}
				item.callback();
			});*/
		}
	}
	$scope.is_speak_disabled = function()
	{
		//console.log($scope.speak_disabled);
		return $scope.speak_disabled;
	}
	
	$scope.speak = function()
	{
		$scope.buffered_speak('The Word is, , , '+$scope.word);
	}
	
	$scope.definition = false;
	$scope.definitions = [];
	$scope.hide_definition = function()
	{ 
		//console.log('show_definition, '+$scope.definition+' '+(typeof $scope.definition));
		
		var value = typeof $scope.definition == 'boolean';
		//$scope.definition != 'false'; 
		
		//console.log(value);
		return value; 
	}
	$scope.get_definition = function(word, callback)
	{
		callback = callback || noop;
		if($scope.hide_definition)
		{
			//console.log('making call');
			var url = 'http://api.wordnik.com/v4/word.json/'+word.toLowerCase()+'/definitions?api_key=27ee8c36f4fd2881b17060148560881d3d73eef5f87f1c26c';
			//console.log(url);
			$http.get(url)
			.success(callback);
		}
		else
		{
			//console.log('using pre-set');
			//console.log( $scope.hide_definition );
			callback($scope.definitions);
		}
	}
	
	$scope.sanitize_definition = function(def)
	{
		var find = $scope.word.toLowerCase();
		var re = new RegExp(find, 'g');
		var temp = def.toLowerCase();
		var replace = Array(find.length).join("*")
		return temp.replace(re, replace);
	}
	
	$scope.speak_definition = function()
	{
		$scope.get_definition($scope.word, function(data)
		{
			console.log(data.length);
			if(data.length == 0)
			{
				data = [];
				data[0] = {};
				data[0].text = 'Sorry, Not able to find a definition.';
			}
			
			$scope.buffered_speak($scope.word+', '+data[0].text);
			
			$scope.definition = $scope.sanitize_definition(data[0].text);
			$scope.definitions = data;
			
			$scope.definitions.forEach(function(element, index, array)
			{
				element.text = $scope.sanitize_definition(element.text);
				//console.log(element.text);
			});
			
			//console.log('$scope.definitions set');
			//console.log($scope.definitions);
		});
	}
	
	
	
	$scope.new_word = function()
	{
		
		$scope.get_definition($scope.word, function(data)
		{
			if($scope.answered == false)
			{
				//console.log(data);
				$scope.answers.unshift(
				{
					word: $scope.word,
					//word_id: $scope.word_id,
					definition: data,
					definitions: data,
					success: false
				});
			}
			$scope.reset();
			//console.log('success');
			$http.get('http://api.wordnik.com/v4/words.json/randomWord?api_key=27ee8c36f4fd2881b17060148560881d3d73eef5f87f1c26c&minCorpusCount=2000&maxLength=10')
			.success(function(data) 
			{
				//console.log(data);
				$scope.word = data.word.trim();
				$scope.word_id = data.id;
				$scope.buffered_speak('Your New Word is, '+$scope.word);
			});
			
			
		});
		
		
	}
	
	$scope.reset = function()
	{
		//console.log('reset called');
		$scope.answered = false;
		$scope.word_guess = '';
		$scope.spoke = 0;
		$scope.definition = false;
		$scope.speak_buffer = [];
	}
	
	$scope.word_guess_length = 0;
	$scope.spoke = 0;
	$scope.answered = false;
	$scope.check_spelling = function()
	{
		//console.log($scope.word_guess);
		
		var length = $scope.word_guess.length;
		if($scope.word_guess_length > length && length > 1)
		{//something was deleted
			length = 0;
			var definition = $scope.definition
			$scope.reset();
			$scope.definition = definition;
		}
		else
		{
			$scope.word_guess_length = length;
		}
		$scope.congrats = ['Great Job','Good Work','Super','Awesome','Way To Go','Spectacular','Stupdendus','Amazing'];
		if(length > 0)
		{
			if($scope.word_guess.toLowerCase() == $scope.word.toLowerCase() && $scope.answered == false)
			{
				$scope.answered = true;
				
				//meSpeak.speak(', '+$scope.word_guess.charAt(length-1)+' , '+$scope.word+', Correct. Great Job!', meSpeak_options,
				var say = ', '+$scope.word_guess.charAt($scope.spoke)+' , '+$scope.word+', Correct. . . ';
				var random_index = Math.floor(Math.random() * ($scope.congrats.length));
				console.log(random_index)
				say += ' '+$scope.congrats[random_index]+'! , , , '
				$scope.buffered_speak(say,
				function()
				{
					var word = $scope.word;
					$scope.get_definition($scope.word, function(data)
					{
						//console.log(data);
						$scope.answers.unshift(
						{
							word: word,
							//word_id: $scope.word_id,
							definition: data,
							definitions: data,
							success: true
						});
						
						//console.log('success');
						$scope.new_word();
						
					});
				});
			}
			else if (length > $scope.word.length)
			{
				$scope.speak_buffer = []
				$scope.reset();
				$scope.buffered_speak('In Correct, Try again!', function()
				{
					/*
					$scope.answered = false;
					$scope.speak_buffer = []
					$scope.spoke = 0;
					*/
					//console.log('incorrect');
				});
			}
			else
			{
				//meSpeak.speak($scope.word_guess.charAt(length-1), meSpeak_options);
				//'console.log($scope.word_guess.charAt($scope.spoke));
				var letter = $scope.word_guess.charAt($scope.spoke);
				if(letter == 'a')
				{
					letter = ' AE ';
				}
				$scope.buffered_speak(letter+' , ');
				$scope.spoke++;
			}
		}
	}
	
	$scope.answer_success = function(answer)
	{
		//console.log(answer); 
		if(answer.success == true)
		{
			return true;
		}
		return false;
	}
	
	$scope.answer_failed = function(answer)
	{
		//console.log(answer); 
		if(answer.success == true)
		{
			return false;
		}
		return true;
	}
	
	
	//check to see if we can even say things
	console.log('checking for feature '+document.documentElement.className);
	if(document.documentElement.className.match('no-feature'))
	{//can't say things, show them the use a better browser page
		console.log('here');
		//window.location.href = 'bad_browser';
		$location.path('/bad_browser')
		
	}
	
}])
.controller('BadBrowserCtrl', ['$scope', '$http', function($scope) 
{
	
}]);



/*var Main = angular.module('Main', []);

Main.controller('MainController', function ($scope) {
  $scope.phones = [
    {'name': 'Nexus S',
     'snippet': 'Fast just got faster with Nexus S.'},
    {'name': 'Motorola XOOM™ with Wi-Fi',
     'snippet': 'The Next, Next Generation tablet.'},
    {'name': 'MOTOROLA XOOM™',
     'snippet': 'The Next, Next Generation tablet.'}
  ];
});
*/
