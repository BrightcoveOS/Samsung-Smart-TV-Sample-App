TVEngine.MediaPlayer = {
	    plugin : null, audioPlugin: null,
	    state : -1,
	    skipState : -1,
	    stopCallback : null,    /* Callback function to be set by client */
	    originalSource : null, streamready: false, allowFastForward: true,
	    
	    STOPPED : 	10, PLAYING : 	11,  PAUSED : 	12,    FORWARD : 	13,  REWIND : 	14,
	    userBitrate: null,
	    _active: false, active: function() { this._active = true }, deactive: function() { this._active = false },
		loop: false,
		
		currentInfoDefaults: {
			duration: "unknown",
			height: "unkown",
			width: "unknown",
		},

		currentInfo: {},
		
		
		init: function() {
			$log(" ___  SAMSUNG PLAYER INIT ___ ")
			var success = true;
			this.state = this.STOPPED;
			this.plugin = document.getElementById("pluginPlayer");
			this.audioPlugin =  document.getElementById("pluginAudio");
			if (!this.plugin) {
				return false;
			} else {
				var mwPlugin =  document.getElementById("pluginTVMW");
				if ( !mwPlugin ) {
					success = false;
				} else if (mwPlugin.GetSource && mwPlugin.SetMediaSource()) {
					/* Save current TV Source */
					this.originalSource = mwPlugin.GetSource();
					/* Set TV source to media player plugin */
					mwPlugin.SetMediaSource();
				}
			}
			
			// Reset Platform to default sets.
			$log("Resetting Coordinates");
			this.setCoordinates(0,0,TVEngine.getPlatform().resolution.width, TVEngine.getPlatform().resolution.height);
			this.plugin.OnAuthenticationFailed	= 	'TVEngine.MediaPlayer.videoError';
			this.plugin.OnBufferingComplete 	= 	'TVEngine.MediaPlayer.bufferingComplete';
			this.plugin.OnBufferingProgress 	= 	'TVEngine.MediaPlayer.bufferingProgress';
			this.plugin.OnBufferingStart 		= 	'TVEngine.MediaPlayer.bufferingStart';
			this.plugin.OnConnectionFailed		= 	'TVEngine.MediaPlayer.videoError';
			this.plugin.OnCurrentPlayTime 		= 	'TVEngine.MediaPlayer.currentPlayTime';
			this.plugin.OnNetworkDisconnected 	=  	'TVEngine.MediaPlayer.videoError';
			this.plugin.OnRenderError			= 	'TVEngine.MediaPlayer.videoError';
			this.plugin.OnMute 					= 	"TVEngine.MediaPlaye.Events.mute";
			this.plugin.OnRenderingComplete 	= 	"TVEngine.MediaPlayer.streamEnded";      
	        this.plugin.OnStreamInfoReady 		=	'TVEngine.MediaPlayer._streamInfoReady';
	        this.plugin.OnStreamNotFound 		=	'TVEngine.MediaPlayer.streamNotFound';
	        
	        this.speedtest();
			$log("<<< END SAMSUNG NATIVE PLAYER INIT >>>");
	        return success;
		},
		
		setPlaylist: function(playlist) {
			this.playlist = playlist;
			this.currentIndex = 0;
			this.trigger("mediaplayer:onnewplaylist", playlist);
		},
		
		setCurrentIndex: function(index) {
			if(this.playlist) {
				this.playlist.setCurrentIndex(index);
			}
		},
		
		play: function() {
			
			$log("Playing Media");
			this.active();
			if(!this.currentStream) {
				$log("NO VIDEO URL SET");
				this.currentStream = this.playlist.nextFile();
			}
			
			$log("SAMSUNG PLAYER URL SET TO: " + this.currentStream.url);
			if(this.state == this.PLAYING) {
				this.pause();
			} else if(this.state == this.PAUSED)  {
				if(! this.plugin.Resume()) {
					this.videoError("FAILED TO RESUME STREAM");
					this.state = this.PLAYING;
					return false;
				} else {
					this.state = this.PLAYING;
					this.trigger("mediaplayer:onresume");
					return true;
				}
			}  else {
				this._playVideo();
			};

		},
		
		_playVideo: function() {
			this.plugin.Stop();
			this.streamready = false;
			this.trigger("mediaplayer:onplay");
			if ( this.plugin.Play(this.currentStream.url)) {
				this.state = this.PLAYING;
			} else {
				this.videoError("FAILED TO START STREAM");
				this.state = this.STOPPED;
			}
		},
		
		nextVideo: function() {
			$log("___ NEXT VIDEO ___ ");
			this.currentStream = this.playlist.nextFile();
			if( this.currentStream) {
				this.trigger('mediaplayer:onnextvideo', this.playlist.currentItemIndex());
				this._playVideo();
			} else {
				$log(" NO NEXT VIDEO, CALLING PLAYLIST END ")
				this.plugin.Stop();
				this.state = this.STOPPED;
				this.trigger("mediaplayer:onplaylistend");
			}
		},
		
		// Controls
		// 'play','pause','rewind','fastforward', 'show', 'setCoordinates', 'next','setUserBitrate','stop', 'playing','hide', 'mute']
		stop: function() {
			$log("HARD STOPPING VIDEO");
			this.state = this.STOPPED
			if(this.plugin) {
				$log(" Calling MediaPlayer Stop ")
				this.plugin.Stop();
				this.plugin.ClearScreen();
				this.currentStream = null;
				this.trigger('mediaplayer:onstop');
			}
		},	
		

		
		pause: function() {
			this.trigger("mediaplayer:onpause");
			if(this.plugin) this.plugin.Pause();
			this.state = this.PAUSED;
		},
		
		fastforward: function() {
			if(this.allowFastForward) {
				this.trigger("mediaplayer:onfastforward");
		   	 	this.plugin.JumpForward(5);
			}
		},
		
		rewind: function() {
			this.trigger("mediaplayer:onrewind");
			this.plugin.JumpBackward(5);
		},
		
		mute: function() {
			var currentMute = this.audioPlugin.GetSystemMute();
			this.audioPlugin.SetSystemMute(currentMute == PLR_FALSE); 
			TVEngine.MediaPlayer.trigger("mediaplayer:onmute", !currentMute);
		},
		
		setCoordinates: function(x,y,width,height) {
			$log(" SETTING COORDINATES TO: x: " + x + " y: " + y + " width: " + width + " height: " + height);
			if(this.plugin.SetDisplayArea) {
				$log("have display area, settings")
				this.plugin.SetDisplayArea(x, y, width, height);
			}
		},


		setUserBitrate: function(bitrate) {
			$log(" SETTING BITRATE TO " + bitrate);
			this.userBitrate = bitrate;
		},
		
		
		playing: function() {
			$log( "TESTING PLAYING ON SAMSUNG PLYAER, STATE: " + this.state);
			return (this.state == this.PLAYING);
		},
		

		
		duration: function() {
			if(this.streamready) {
				return this.plugin.GetDuration();
			} else {
				return null;
			}
		},

		
		// Events
		
		onDone: function() {
			$log("Video play done");
			if(this.loop) this.play();
			else this.videoUrl = null;
		},
		

		
		shutdown: function() {
			this.stop();
	        var mwPlugin = document.getElementById("pluginTVMW");
	        if (mwPlugin && (this.originalSource != null) ) {
	            /* Restore original TV source before closing the widget */
	            mwPlugin.SetSource(this.originalSource);
	            alert("Restore source to " + this.originalSource);
	        }	
		},


		/*
		 * 
		 * 			
		 * this.plugin.OnAuthenticationFailed	= 	'TVEngine.MediaPlayer.videoError';
			this.plugin.OnBufferingComplete 	= 	'TVEngine.MediaPlayer.bufferingComplete';
			this.plugin.OnBufferingProgress 	= 	'TVEngine.MediaPlayer.bufferingProgress';
			this.plugin.OnBufferingStart 		= 	'TVEngine.MediaPlayer.bufferingStart';
			this.plugin.OnConnectionFailed		= 	'TVEngine.MediaPlayer.videoError';
			this.plugin.OnCurrentPlayTime 		= 	'TVEngine.MediaPlayer.currentPlayTime';
			this.plugin.OnNetworkDisconnected 	=  	'TVEngine.MediaPlayer.videoError';
			this.plugin.OnRenderError			= 	'TVEngine.MediaPlayer.videoError';
			this.plugin.OnMute 					= 	"TVEngine.MediaPlaye.Events.mute";
			this.plugin.OnRenderingComplete 	= 	"TVEngine.MediaPlayer.nextVideo";      
	        this.plugin.OnStreamInfoReady 		=	'TVEngine.MediaPlayer._streamInfoReady';
	        this.plugin.OnStreamNotFound 		=	'TVEngine.MediaPlayer.streamNotFound';
		 */

	videoError: function() {
		var args = Array.prototype.slice.call(arguments, 0);
		args.unshift("mediaplayer:videoerror");
		this.trigger.apply(this, args)
	},
	bufferingStart: function() {
		this.trigger("mediaplayer:bufferingstart");
	},
	bufferingProgress: function(progress) {
		this.trigger("mediaplyaer:bufferingprogress", progress)
	},
	bufferingComplete: function() {
		this.trigger("mediaplayer:bufferingend");
	},

	currentPlayTime: function(currentTime) {
		this.trigger("mediaplayer:timeupdate", currentTime);
	},
	streamEnded: function() {
		this.nextVideo();
		this.trigger("mediaplayer:mediaend");
	},
	mute: function(mute) {
		this.trigger("mediaplayer:muted", mute);
	},
	_streamInfoReady: function() {
		$log("Stream info ready: " +  Array.prototype.slice.call(arguments, 0).join("\n ") );
		this.streamready = true;
		this.trigger("mediaplayer:streaminfoready")
	},
	streamNotFound: function() {
		$log(" STREAM NOT FOUND ");
		this.trigger("mediaplayer:videoerror", "stream not found");
	},
}
_.extend(TVEngine.MediaPlayer,  Backbone.Events);
_.extend(TVEngine.MediaPlayer, TVEngine.MediaPlayerCore);
TVEngine.addModule("MediaPlayer", TVEngine.MediaPlayer);
