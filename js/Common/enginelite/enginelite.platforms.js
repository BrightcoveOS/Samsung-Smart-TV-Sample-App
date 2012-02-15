/**
 * 
 *  Simple TV App Engine Platform Handling
 *  
 *  author: A Different Engine LLC.
 *  http://adifferentengine.com
 *  contact@adifferentengine.com
 *
 */
TVEngine.Platforms = {
	
    // 4 Primary Platforms (for now) samsung, lg, googletv, browser
    platform: null, proxy: "",// Default
    
    supportedPlatforms: {},
    addSupportedPlatform: function(platform) {
    	this.supportedPlatforms[platform.name] = platform;
    	if(platform.defaultPlatform == true) {
    		this.defaultPlatform = platform;
    	}
    },
    
	init: function() {
		// $.each(['appCodeName','appName','appVersion','userAgent','platform'], function(index, item) {
		// 	$log(" ___ NAVIGATOR."+item + ": " + navigator[item] + " ___");
		// });
        
		_.each(this.supportedPlatforms, function(platform) {
			if(!platform.defaultPlatform && platform.detectPlatform()) {
				this.platform = platform;
				return;
			}
		}, this);
		if(!this.platform && !this.defaultPlatform ) {
			$error("!!!! NO PLATFORM DETECTED, AND NO DEFAULT PLATFORM !!!!");
			return;
		} else if (!this.platform) {
			$log(" COULD NOT DETECT PLATFORM, USING DEFAULT ("+this.defaultPlatform.name+")");
			this.platform = this.defaultPlatform;
		}
		// $log("<< PLATFORM IS: ("+this.platform.name+") >>")
		this.platform.init();
		this.platform.addPlatformCSS();
		this.platform.fetchMediaPlayer();
		
		// Going to add our proxy stuff if needed
		var platform = this.platform;
		if(_.isFunction($.ajaxPrefilter)) {
			$.ajaxPrefilter( function(options, originalOptions) {
				var proxy = platform.proxy();
				if( proxy !== "" ) {
					// Create the URL.
					
					var data = originalOptions.data || {};
					data['url'] = originalOptions.url;
					options.data = $.param(data);
					options.url = proxy;
				}
				$log(options)
			});
		}

	}
}

// Master "Class" for Platforms.

TVEngine.Platform = function(name) {
	this.name = name; this.defaultPlatform = false;
	this._mediaPlayer = "videotag";
	this.start = $noop;
	this.exit = $noop;
	this._keys = {
		KEY_RETURN: 	36, //8
	    KEY_UP: 	   	38,
	    KEY_DOWN: 		40,
	    KEY_LEFT: 		37,
	    KEY_RIGHT: 		39,
		KEY_ENTER: 		13,
		KEY_RED: 		65,
		KEY_GREEN: 		66,
		KEY_YELLOW: 	67,
		KEY_BLUE: 		68,
		KEY_BACK: 		8,
		KEY_PLAY: 		80,
	}
	 this.resolution = {
	 	height: 540, width: 960
	 }
//	this.resolution = {
//		height: 720, width: 1280
//	}
	
	// You can override this if you'd like
	this.init = $noop;
	
	// Might want to set this to something different
	this.needsProxy = null;

}
// override this if necessary
TVEngine.Platform.prototype.keys = function() {
	return this._keys;
}
TVEngine.Platform.prototype.setMediaPlayer = function(mediaplayer) {
	this._mediaPlayer = mediaplayer;
}
TVEngine.Platform.prototype.fetchMediaPlayer = function() {
	if( this._mediaPlayer ) {
	//	$log("Adding media player path");
		var path = "js/Common/enginelite/mediaplayers/enginelite.mediaplayer."+this._mediaPlayer.toLowerCase()+".js?" + new Date().getTime();
	//	$log("Adding media player path: " + path);
		$("<script />", { src: path, type: 'text/javascript' }).appendTo("head");
	}
}

TVEngine.Platform.prototype.cleanAppVersion = function() {
	var version = navigator.appVersion.match(/^[^\s]*/)[0] || null;
	if (version == null ) return null;
	split = version.split(".")
	return {
		major: split[0], minor: split[1], mod: split[2]
	}
};

TVEngine.Platform.prototype.setResolution = function(width, height) {
	this.resolution.height = height;
	this.resolution.width = width;
}
TVEngine.Platform.prototype.matrix = function() {
	return this.resolution.width+"x"+this.resolution.height;
}

TVEngine.Platform.prototype.addPlatformCSS = function() {
	// $log(" ADDING PLATFORM CSS FOR PLATFORM: " + this.name  + " path: css/platforms/"+this.name.toLowerCase()+".css and resolution: css/resolutions/"+this.matrix()+".css" );
	$("<link/>", { rel: "stylesheet", type: "text/css", href: "css/platforms/"+this.name.toLowerCase()+".css" }).appendTo("head");
	$("<link/>", { rel: "stylesheet", type: "text/css", href: "css/resolutions/"+this.matrix()+".css" }).appendTo("head");
}

// Override this 
TVEngine.Platform.prototype.detectPlatform = function() {
	if(!this.defaultPlatform) $error(" <<< PLATFORM MUST OVERRIDE THE DETECT PLATFORM METHOD >>>");
}


TVEngine.Platform.prototype.proxy = function() {
	return this.needsProxy ? "proxy.php" : "";
}


/* The first default platform "browser" */
;(function(){
	var browser = new TVEngine.Platform('browser');
	browser.needsProxy = true;
	// We want this to fail, and get added as default
	browser.defaultPlatform = true;
	TVEngine.Platforms.addSupportedPlatform(browser);
}());