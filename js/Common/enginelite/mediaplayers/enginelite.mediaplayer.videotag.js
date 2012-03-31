// HTML 5 Video tag Media Player
// Note these are all 
TVEngine.MediaPlayer = {
	_active: false, active: function() { this._active = true }, deactive: function() { this._active = false },
	_videoElement: null, allowFastFoward: true,
	init: function() {
		this._videoElement = $("video:first")[0];
		if(!this._videoElement ) {
			var obj = this._createVideoTag();
			obj.trigger("mediaplayer:videotagadded");
		} else {
			this._trackEvents();	
		}
		this.speedtest();
	},
	_createVideoTag: function() {
			$log(" ___ CREATING VIDEO TAG ___ ")
			this.eventsBound = false;
			var obj = $("<video></video>");
			$("body").append(obj);
			this._videoElement = $("video:first")[0];
			this._trackEvents();
			return obj;
	},
	
	setPlaylist: function(playlist) {
		$log(" Setting new Playlist ");
		this.trigger("mediaplayer:onnewplaylist", playlist);
		this.stop(true);
		this.playlist = playlist;
		this.currentIndex = 0;
		this.currentStream = null;
		$(this._videoElement).show();
	},
	
	setCurrentIndex: function(index) {
		$log(" Setting current Index ");
		if( this.playlist ) {
			this.currentIndex = index;
			this.playlist.setCurrentIndex(index);
		}
	},
	
	play: function() {
		$log("Playing Media");
		if(!this.playlist) {
			$error(" Can't press play on a mediaplayer without a playlist")
			return;
		}
		this.active();
		if( this._videoElement && !this._videoElement.paused &&  (typeof(this._videoElement.playbackRate) != 'undefined' && this._videoElement.playbackRate != 1) ) {
			$log(" Restting Playback Rate")
			this._videoElement.playbackRate = 1;
		} else if(this._videoElement &&  this.currentStream == null ) {
			this._trackEvents();
			$log(" Playing NExt File ")
			this.currentStream = this.playlist.nextFile();
			this._playVideo();
		} else if (this._videoElement ){
			if( this._videoElement.paused ) {
				$log(" Calling Video Element Play")
				this._videoElement.play();
			} else {
				$log(" Calling Video Element Pause ")
				this._videoElement.pause();
			}
		}
	},
	
	_playVideo: function()	{
		$log(" SETTING CURRENT STREAM TO: " + this.currentStream.url);
		$(this._videoElement).attr('autoplay', 'play');
		$(this._videoElement).attr('src',this.currentStream.url);
		this._videoElement.load();
		// this._videoElement.play();
		this.wasMuted = this._videoElement.muted;
		
	},
	
	nextVideo: function() {
		this.currentStream = this.playlist.nextFile()
		if(this.currentStream) {
			this.trigger('mediaplayer:onnextvideo', this.playlist.currentItemIndex());
			this._playVideo();
		} else {
			this.trigger("mediaplayer:onplaylistend");
		}
	},

	stop: function(forced) {
		if(this._videoElement) {
			try {
				this._videoElement.playbackRate = 1;
				this._videoElement.currentTime = 0;
				this.currentStream = null;
				this._videoElement.pause();	
				if(!forced) this.trigger("mediaplayer:onstop");
			} catch(e) {} // If this doesn't succeed, it doesn't matter, just die gracefully
			
		}
	},
	
	pause: function() {
		// May get called without the correct initialization, so wrapping in block.
		// This should always fail gracefully.
		try {
			this._videoElement.pause();	
			this.trigger("mediaplayer:onpause");
		} catch(e) {
			$log(" FAILED TO PAUSE VIDEO: " + e);
		}
	},
	
	fastforward: function() {
		if(! this.allowFastFoward ) return;
		if( !this._videoElement.paused && this._videoElement.playbackRate != 1 ) { 
			this._videoElement.playbackRate = 1;
		} else {
			this._videoElement.play();
			this._videoElement.playbackRate = 3;
		}
		this.trigger("mediaplayer:onfastforward");
	},
	rewind: function() {
		if( !this._videoElement.paused && this._videoElement.playbackRate != 1 ) { 
			this._videoElement.playbackRate = 1;
			this.trigger("mediaplayer:onrewind", 1);
		} else {
			this._videoElement.play();
			this._videoElement.playbackRate = -3;
			this.trigger("mediaplayer:onrewind", -3);
		}
	},
	
	mute: function(muted) {
		if(this._videoElement) {
			// need to hold on to this so we know when we've switched state in our onvolumechange handler.
			this.wasMuted = this._videoElement.muted; 
			if (typeof(muted) == 'undefined') muted = !this._videoElement.muted;
			this._videoElement.muted = muted;
		}
	},
	

	setCoordinates: function(x, y, width, height) {
		$(this._videoElement).css({
			left: x, top: y, width: width, height: height
		})
	},

	
	playing: function() {
		var test = (this._videoElement.paused) ? false : true;
		return  test
	},
	
	duration: function() {
		if(_.isNaN(this._videoElement.duration)) {
			return null;
		} else {
			return Math.floor(this._videoElement.duration * 1000);
		}
	},
	
	setVideoElement: function(element) {
		this._videoElement = $(element);
	},
	_eventsToTrack: ['loadstart', 'ended', 'timeupdate','play','pause','loadstart','timeupdate','error','loadeddata','volumechange','duration'],
	wasMuted: false,
	
	_trackEvents: function() {
		$log("___ TRACK EVENTS CALLED ___ ");
		if(this.eventsBound) return;
		var player = this;
		$log(" ___ BINDING EVENTS ___ ");
		$(this._videoElement).bind(this._eventsToTrack.join(" "), $.proxy(this._eventHandler, this) );
		this.eventsBound = true;	
	},
	
	_eventHandler: function(e) {
		if(e.type != 'timeupdate') $log(e.type);
		switch(e.type)  {
			case 'timeupdate':
				this.trigger("mediaplayer:timeupdate",Math.round(e.currentTarget.currentTime * 1000) );
				break;
			case 'loadstart':
				this.trigger("mediaplayer:bufferingstart");
				break;
			case 'loadeddata':
				this.trigger("mediaplayer:bufferingend");
				break;
			case 'ended':
				this.trigger("mediaplayer:mediaend", this.playlist.currentItemIndex());
				this.nextVideo();
				break;
			case 'play':
				this.trigger("mediaplayer:play", this.playlist.currentItemIndex());
				break;
			case 'pause':
				this.trigger("mediaplayer:pause");
				break;
			case 'error':
				$(this._videoElement).remove();
				this._createVideoTag();
				this.trigger("mediaplayer:videoerror");
				break;
			case 'volumechange':
				$log(" VOLUME CHANGE EVENT ");
				if(player.wasMuted != this.muted) {
					this.trigger("mediaplayer:muted");
				}
				this.trigger("mediaplayer:volumechange", e.currentTarget.volume);
				break;
		}
	},
	
	_stopTrackingEvents: function() {
		$log(" UNBINDING MEDIA EVENTS TO HTML5 VIDEO PLAYER ")
		$(this._videoElement).unbind(this.eventsToTrack, this._eventHandler);
		this.eventsBound = false;
	},
}
_.extend(TVEngine.MediaPlayer,  Backbone.Events);
_.extend(TVEngine.MediaPlayer, TVEngine.MediaPlayerCore);
TVEngine.addModule("MediaPlayer", TVEngine.MediaPlayer);