/**
 * 
 *  Simple TV App Engine Data Loading
 *  
 *  author: A Different Engine LLC.
 *  http://adifferentengine.com
 *  contact@adifferentengine.com
 *
 */
/*
	This core gets extended onto the media players. Unless we've done something wrong 
	you should never write TVEngine.MediaPlayerCore.[something] you can access these
	variables if needed from TVEngine.MediaPlayer

*/
TVEngine.MediaPlayerCore = {
	_testUrl: null, // "http://assets.adifferentengine.com/SizedDownloads/512KB.json",
	_testSize: 512000, _active: false, userBitrate: 10000,
	speedtest: function(callback) {
		// $log(" ___ PERFORMING SPEEDTEST ___ ");
		callback = callback || $noop;
		this.startTestTime = new Date().getTime();
		var _this = this;
		if(!TVEngine.config.speedTestUrl) return;
		$.get(TVEngine.config.speedTestUrl, function() {
				// $log(" ___ SPEEDTEST SUCCESS ___ ");''
				var bitrate = Math.round(_this._testSize / (new Date().getTime() - _this.startTestTime) * 1000 / 1024 * 8);
				// $log( "___ USER BITRATE DETECTED: " + bitrate + " ____");
				_this.userBitrate = bitrate;
		});
	},
	
	active: function() {
		this._active = true;
		TVEngine.KeyHandler.bind("all", this._keyhandler, this);
	},
	
	deactive: function() {
		this._active = false;
		TVEngine.KeyHandler.unbind("all", this._keyhandler);
	},
	
	_keyMap: {
		'onPlay': this.play,'onPause': this.pause, 'onRew': this.rewind, 'onFF': this.fastforward, 'onStop': this.stop,
	},
	
	_keyhandler: function(event) {
		$log("MediaPlayer Event Handler Got: " + event);
		var event = event.replace("keyhandler:","");
		switch(event) {
			case 'onPause':
				this.pause();
				break;
			case 'onPlay':
				this.play();
				break;
			case 'onStop':
				this.stop();
				break;
			case 'onRew':
				this.rewind(); 
				break;
			case 'onFF':
				this.fastforward(); 
				break;
		}
	}
	
}

TVEngine.Playlist = function() {
	this.files = [];
	this.currentIndex = 0;
	this.looping = false;
	
	/*
	A Playlist Format, an Array of Arrays of Hashes
	
	[
	 	{
	 		// First Video
			renditions: [
				{
					url: "http://testvids.adifferentengine.com/MyTest-400.mp4",
					bitrate: 400,
				},
		 		{
					url: "http://testvids.adifferentengine.com/MyTest-1500.mp4",
					bitrate: 1500
				},
		 		{
					url: "http://testvids.adifferentengine.com/MyTest-3000.mp4",
					bitrate: 3000
				}
			]
		}
	]
	
	*/
	this.resetIndex = function() {
		this.currentIndex = 0;
	},
	this.currentItemIndex = function() {
		return this.currentIndex - 1;
	}
	
	
	this.nextFile = function() {
		var bitrate = TVEngine.MediaPlayer.userBitrate || 10000; // Should be the largest bitrate
		if(this.currentIndex == this.files.length) {
			$log(" REACHED THE END OF PLAYLIST");
			this.resetIndex();
			if (!this.looping) return null;
		}
		var renditions = this.files[this.currentIndex++].renditions;
		//$log(" RENDITIONS -->");
		//$log(renditions)
		var file = renditions.shift();
		_.each(renditions, function(rendition) {
			// $log(" TESTING file.bitrate: " + file.bitrate + " rendition.bitrate: " + rendition.bitrate + " my bitrate: " + TVEngine.MediaPlayer.userBitrate)
			if( rendition.bitrate > file.bitrate && rendition.bitrate < TVEngine.MediaPlayer.userBitrate ) {
				file = rendition;
			}
		});
		return file;
	}
	
	
	this.addFiles = function(files) {
		this.files = files;
	}
	this.addPreroll = function(renditions, isAd) {
		var isAd = _.isNull(isAd) ? true : isAd; // We default to it being an ad.
		if(!_.isArray(renditions)) renditions = [renditions];
		this.files.unshift({
			isAd: isAd, renditions: renditions
		});
	}

	this.addItem = function(renditions, isAd) {
		var isAd = _.isNull(isAd) ? false : isAd;
		if(!_.isArray(renditions)) renditions = [renditions];
		this.files.push({
			isAd: isAd, renditions: renditions
		});
	}
	
	this.setUserBitrate = function( bitrate ) {
		this.userBitrate = bitrate;
	}
	this.setCurrentIndex = function(index) {
		$log("Playlist index set to: " + index)
		this.currentIndex = index;
	}
	this.addUrl = function(url) {
		this.files.push([{
			speed: null, url: url
		}]);
	}
	this.loop = function(toLoop) {
		this.looping = !!toLoop; // force a boolean
	};
	return this;
};