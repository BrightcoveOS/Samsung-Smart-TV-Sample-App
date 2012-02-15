/**
 * 
 *  Simple TV App Engine.
 *  
 *  author: A Different Engine LLC.
 *  http://adifferentengine.com
 *  contact@adifferentengine.com
 *
 */
TVEngine = {
	modules: {}, _doneEvents: [], _modulesToLoad: 0, _defConfig: {},
	
	addModule: function(name, module, conf) {
		this.modules[name] = module;
		conf = conf || {}
		conf = _.defaults(conf, {
			callbacks: []
		})
		this._doneEvents = _.union(this._doneEvents, conf.callbacks);
		_.each(conf.callbacks, function(callback) {
			module.bind(callback, function() {
				this.itemLoaded(callback);
			}, this)
		}, this)
	},
	
	moduleExists: function(name) {
		return (!_.isNull(this.modules[name]))
	},
	
	itemLoaded: function(callback) {
		$log("<<< ITEM LOADED >>>");
		this._modulesToLoad = _.without(this._modulesToLoad, callback);
		if (this._modulesToLoad.length == 0 ) {
			this.trigger("tvengine:appready");
		}
	},
	
	start: function(config) {
		this.config = _.defaults(config, this._defConfig);
		
		this.getPlatform().start();
		this.trigger("tvengine:starting");
		this.KeyHandler.init();
		this.Navigation.init();
		this._modulesToLoad = this._doneEvents;
		
			_.each(this.modules, function(m) {
				$log(" <<< INIT MODULE "+m.name+ ">>> ");
				$log(m)
				if (_.isFunction(m.init))  m.init();
				$log("<<< END INIT MODULE >>>")
			});
		
		$("<<< END TVEngine Start >>>");
		var _this = this;
		TVEngine.KeyHandler.bind("keyhandler:onExit", function() {
			$log(" GOT EXIT FROM KEYHANDLER ")
			_this.getPlatform().exit(true);
		})
	},
	exit : function(fullexit) {
		$log("********************************\n       EXIT     \n ********************************");
		this.getPlatform().exit(fullexit);
	},

	getPlatform: function() {
		if(this.Platforms && this.Platforms.platform ) {
			return this.Platforms.platform;
		} else {
			return null;
		}
	},
	
	getProxiedUrl: function(url) {
		var platform = this.getPlatform();
		return platform.proxy() + url;
	},
	
	
	util : {
		error : function(msg) {
			if (typeof (console) != "undefined" && console.error) {
				console.error(msg);
			} else {
				alert(TVEngine.util.dump(msg, 4));
			}
		},
		debug : function(msg) {
			this.log(msg, 'debug')
		},
		dump : function(arr, level) {
			var dumped_text = "";
			if (!level)
				level = 0;

			// The padding given at the beginning of the line.
			var level_padding = "";
			for ( var j = 0; j < level + 1; j++)
				level_padding += "    ";

			if (typeof (arr) == 'object') { // Array/Hashes/Objects
				for ( var item in arr) {
					var value = arr[item];

					if (typeof (value) == 'object') { // If it is an array,
						dumped_text += level_padding + "'" + item + "' ...\n";
						dumped_text += TVEngine.util.dump(value, level + 1);
					} else {
						dumped_text += level_padding + "'" + item + "' => \""
								+ value + "\"\n";
					}
				}
			} else { // Stings/Chars/Numbers etc.
				dumped_text = "===>" + arr + "<===(" + typeof (arr) + ")";
			}
			return dumped_text;
		},
		
		log : function(msg) {
			msg = msg || "No Message";
			if(_.isString(msg)) {
				now = new Date();
				msg = "["+now.getFullYear()+"-"+(now.getMonth() + 1).toString()+"-"+now.getDate()+" " + now.getHours()+":"+now.getMinutes()+":"+now.getSeconds()+"."+now.getMilliseconds()+"] " + msg;
			};
			// The ADEngine box sometimes has issues with the console. Comment
			// this out when deploying
			if (typeof (console) != "undefined" && console.log) {
				$.log(msg);
			} else {
				alert(msg);
			}
		},
		
		getImageForResolution: function(imgPath, conf) {
			conf = _.defaults(conf, {
				src: "images/"+TVEngine.Platforms.platform.matrix()+"/"+imgPath
			});
			// Kind of strange but its a consistent way to get the html of the element
			// that we want.
			document.write($('<div>').append($("<img />", conf).clone()).remove().html());
		},
		convertMstoHumanReadable : function(ms, leadingZeros) {
			leadingZeros = typeof (leadingZerons) == 'undefined' ? true
					: !!leadingZeros // Make sure its boolean

			var x = ms / 1000
			var numSecs = seconds = Math.floor(x % 60)
			x /= 60
			var numMins = minutes = Math.floor(x % 60)
			x /= 60
			hours = Math.floor(x % 24)
			x /= 24
			days = Math.floor(x);

			var numMs = ms - (seconds * 1000);

			if (leadingZeros) {
				if (numSecs < 10) {
					numSecs = "0" + numSecs.toString();
				}
				if (numMins < 10) {
					numMins = "0" + numMins.toString();
				}
			}

			return {
				millis : numMs, seconds : numSecs, minutes : Math.floor(numMins), hours : Math.floor(hours),
				toString : function() {
					var str = numSecs;
					if (Math.floor(numMins))
						str = numMins + ":" + str;
					else
						str = "00:" + str;
					if (Math.floor(hours))
						str = hours + ":" + str;
					return str;
				}
			}
		}
	}
}
_.extend(TVEngine, Backbone.Events);


window.$log = TVEngine.util.log;
window.$error = TVEngine.util.error;
window.$i = TVEngine.util.getImageForResolution;
window.$noop = function(input) {
	// if more then one return an array.
	if (arguments.length > 1 ) return Array.prototype.slice.call(arguments, 0);
	else return arguments[0]; // Don't return an array if only one thing came in.
}

// Start her up, note that $(window).load
// will wait for all images to load before starting.
$(window).load(function() {
	// Turns on support for cross domain AJAX requests.
	$.support.cors = true;
	$log("JQUERY VERSION: " + $().jquery);
	TVEngine.start(TVAppConfig);
});

// JQuery ajax likes to run in a try/catch style sceneario, lets capture these
$("<div />").ajaxError(function(e, aj, settings, exception) {
	$error(exception);
	$error(settings)
})
TVEngine.Tracker = {
	trackEvent: function(category, action, label, value) {
		if(TVEngine.Tracker.Google && _.isFunction(TVEngine.Tracker.Google.trackEvent)) {
			TVEngine.Tracker.Google.trackEvent(category,action,label,value);
		}
		if(TVEngine.Tracker.Omniture && _.isFunction(TVEngine.Tracker.Omniture.trackEvent)) {
			TVEngine.Tracker.Google.trackEvent(category,action,label,value);
		}
	}
}


/* Extensions to existing Javascript objects */
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "");
}
String.prototype.ltrim = function() {
	charlist = !arguments[0] ? ' \\s\u00A0' : (arguments[0] + '').replace(
			/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
	var re = new RegExp('^[' + charlist + ']+', 'g');
	return this.replace(re, '');
}
String.prototype.rtrim = function() {
	var charlist = !arguments[0] ? ' \\s\u00A0' : (arguments[0] + '').replace(
			/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\\$1');
	var re = new RegExp('[' + charlist + ']+$', 'g');
	return this.replace(re, '');
}
String.prototype.capitalize = function() {
	return this.replace(/\S+/g, function(a) {
		return a.charAt(0).toUpperCase() + a.slice(1).toLowerCase();
	});
};