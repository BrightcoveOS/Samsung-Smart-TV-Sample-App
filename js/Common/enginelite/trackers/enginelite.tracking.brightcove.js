TVEngine.Tracker = TVEngine.Tracker || {};
TVEngine.Tracker.Brightcove = {
  _playerID: null, _publisherID: null, eventsBeingTracked: false, playlist: null,
  _trackEvents: function() {
    if(this.eventsBeingTracked) return;
    var _this = this;
    TVEngine.MediaPlayer.bind("mediaplayer:onnewplaylist", function() {
      $log("NEW PLAYLIST ")
    });
    TVEngine.MediaPlayer.bind("mediaplayer:play", function(index) {
      $log("PLAYER PLAY: " + index);
      if(_this.playlist && _this.playlist.videos && _this.playlist.videos[index]) {
        _this.trackVideoStart(_this.playlist.videos[index].id);
      }
    });
    TVEngine.MediaPlayer.bind("mediaplayer:mediaend", function(index) {
      $log("VIDEO END: " + index);
      if(_this.playlist && _this.playlist.videos && _this.playlist.videos[index]) {
        _this.trackVideoCompleted(_this.playlist.videos[index].id);
      }
    });
  },

  
  init: function(playerid, pubid, playlist ) {
    this._playerID = playerid; this._publisherID = pubid;
    this.playlist = playlist;
    this._trackEvents();
  },
  
  
	trackVideoStart: function(videoid) {
	  $log("Tracking video start, ")
	  $("#brightcoveTracker").attr("src", this._fetchUrl(videoid, "video_start"));
	},
	
	trackVideoCompleted: function(videoid) {
	  $log("Tracking video start, ")
	  $("#brightcoveTracker").attr("src", this._fetchUrl(videoid, "video_completed"));	  
	},
	
	playerLoad: function(videoid) {
	  $("#brightcoveTracker").attr("src",  this._fetchUrl(videoid, "player_load" ));
	},
	
	_fetchUrl: function(videoid, e) {
	  return "http://goku.brightcove.com/1pix.gif?dcsref=notavailable&playerId="
	      +this._playerID+"&publisherId="
	      +this._publisherID+"&affiliateId=&playerTag=&videoId="
	      +videoid+"&dcsuri=/viewer/"+e;
	}
}