TVEngine.AdVendors = TVEngine.AdVendors || {};
TVEngine.AdVendors.VastPreroll = {
	_callback: null, _videos: [], _response: null,
	fetchAndPlayPreRollAd: function(url, callback) {
		this._callback = callback; 
		var _this = this;
		$("#nowPlayingTitle").text("Your video will begin shortly.");
		$.ajax({
			type: "GET", url: url, dataType: 'xml', data: { mode:"native" }, 
			success: function(data) {
				_this.parseResponse.call(_this, data);
			}, error: function() {
				_this.error.call(_this)
			}
		})
	},
	
	parseResponse: function(response) {
		this._response = response;
		var mediaFiles = [];
		$(response).find("MediaFile").each( function(idx, file) {
			if ($(file).attr("type") == "video/mp4") {
				mediaFiles.push({
					bitrate: $(file).attr("bitrate"), url: $(file).text()
				});
			}
		});
		if(mediaFiles && mediaFiles.length > 0) {
			this._playPreroll(mediaFiles);
		} else {
			this._callback();
		}
	},
	error: function() {
		$error("Failed to fetch VAST videos");
		if (_.isFunction(this._callback)) this._callback();
	},
	
	_playPreroll: function(mediaFiles) {
		TVEngine.MediaPlayer.allowFastFoward = false;
		var playlist = new TVEngine.Playlist();
		playlist.addItem(mediaFiles);
		TVEngine.MediaPlayer.setPlaylist(playlist);
		TVEngine.MediaPlayer.play();
		TVEngine.MediaPlayer.bind("mediaplayer:onplaylistend", function() {
			$log("Pre-Roll End");
			// TVEngine.MediaPlayer.allowFastFoward = true;
			// this._preRollDone();
			TVEngine.MediaPlayer.unbind("mediaplayer:onplaylistend");
			TVEngine.MediaPlayer.unbind("mediaplayer:videoerror");
			this._callback();
		}, this);
		TVEngine.MediaPlayer.bind("mediaplayer:videoerror", function() {
			$log("Pre-Roll Error");
			// TVEngine.MediaPlayer.allowFastFoward = true;
			// 	this._preRollDone();
			TVEngine.MediaPlayer.unbind("mediaplayer:onplaylistend");
			TVEngine.MediaPlayer.unbind("mediaplayer:videoerror");
			this._callback();
		}, this);
	},
	_preRollDone: function() {
		this._callback();
	}
}