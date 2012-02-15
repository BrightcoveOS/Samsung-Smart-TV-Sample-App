/**
 * 
 *  Simple TV App Engine Data Loading
 *  
 *  author: A Different Engine LLC.
 *  http://adifferentengine.com
 *  contact@adifferentengine.com
 *
 */

// Loads everything asynchronously, pretty simple ability to track
// incoming data.

TVEngine.DataLoader = {
	_dataSets: [], _loaded: 0, _waterfalls: [],
	
	addDataSet: function(set) {
		if(set.key == null) throw("Trying to add Data item with no key, url: " + set.getUrl());
		this._dataSets.push(set);
	},
	// Takes multiple data items and loads them one at at time passing the data,
	// from each call back into the next call.
	addWaterfall:function(key, sets) {
		if(!key) throw("Trying to add Waterfall with no key");
		this._waterfalls.push(new TVEngine.DataLoader.Waterfall(key, sets));
	},
	
	
	init: function() {
		this._loaded = this._dataSets.length + this._waterfalls.length; 
		var _this = this;
		this.trigger("dataloader:loading");
		
		if(this._dataSets.length == 0 && this._waterfalls.length == 0 ) {
			this.trigger("dataloader:loaded");
			return;
		}
		
		_.each(this._waterfalls, function(item) {
			item.bind("all", function() { this.loadedItem(); }, _this);
			item.load();
		})
		_.each(this._dataSets, function(data) {
			$log(" Fetching data from url: " + data.getUrl() + " data type: " + data.dataType)
			$.ajax({
				// url: data.getProxiedUrl(),
				url: data.getUrl(),
				dataType: data.dataType,
				data: data.getParams(),
				success: function(input) {
					$log("<<< DATA LOADING SUCCESS >>>")
					if (typeof input == "string") input = $.parseJSON(input)
					TVEngine.DataStore.set(data.key, data.parser(input));
					_this.loadedItem();
				},
				error: function() {
					$error("!!! ERROR LOADING DATA ITEM "+data.key+"!!!");
					_this.loadedItem();
				}
			});
		});
	},
	
	loadedItem: function() {
		this._loaded--;
		if(this._loaded == 0 ) {
			this.trigger("dataloader:loaded");
		}
	},	
}
TVEngine.DataStore = {
	_data:  {},
	set: function(key, data) {
		this._data[key] = data;
	},
	get: function(key) {
		return this._data[key]  
	}
}
_.extend(TVEngine.DataLoader, Backbone.Events);
TVEngine.addModule('DataLoader', TVEngine.DataLoader, {
	callbacks: ['dataloader:loaded']
});

TVEngine.DataLoader.Waterfall = function(key, items) {
	this.datastoreKey = key;
	this.dataItems = items;
	this.currentData = null;
	_.extend(this, Backbone.Events);
}
	
TVEngine.DataLoader.Waterfall.prototype.load = function() {
	this.currentIndex = 0;
	this.currentData = 0;
	this.loadNextItem();
}

TVEngine.DataLoader.Waterfall.prototype.loadNextItem = function() {
	var dataItem = this.dataItems[this.currentIndex];
	// if(!dataItem) return;
	var _this = this;
	dataItem.startdata = this.currentData;
	$.ajax({
		url: dataItem.getUrl(),
		dataType: dataItem.dataType,
		data: dataItem.getParams(),
		success: function(input) {
			if (typeof input == "string" && data.dataType.toUpperCase() == "JSON") input = $.parseJSON(input);
			_this.currentData = dataItem.parser(input);
			_this.next();
		},
		error: function() {
			_this.error();
		}
	});
}
TVEngine.DataLoader.Waterfall.prototype.next = function() {
	this.currentIndex++;
	if (this.currentIndex == this.dataItems.length) this.done();
	else this.loadNextItem();
}

TVEngine.DataLoader.Waterfall.prototype.done = function() {
	TVEngine.DataStore.set(this.datastoreKey, this.currentData);
	this.trigger("waterfall:done");
}
TVEngine.DataLoader.Waterfall.prototype.error = function() {
	$error("Failed to load with depdencies");
	this.trigger("waterfall:error");
}



TVEngine.DataLoader.Data = function() {
	this.method = "GET", this.dataType = "JSON";
	this.key  = null;
	// Can override these (make sure you return something);
	// once done we will parse the data then pass it to the data
	// handler
	
	this.parser = $noop;
}

// you can override this if you want to.
TVEngine.DataLoader.Data.prototype.getUrl = function() {
	return this.url;
}



TVEngine.DataLoader.Data.prototype.getProxiedUrl = function() {
	var platform = TVEngine.getPlatform();
	if(platform && platform.proxy() !== "" ) {
		var url = this.getUrl(), params = this.getParams();
		if( params && this.method == "GET" ) url += "?" + escape($.param(params));
		return platform.proxy() + url;
	} else {
		return this.getUrl();
	}
}

// Can Override.
TVEngine.DataLoader.Data.prototype.getParams = function() {
	return this.params;
}

TVEngine.DataLoader.Data.prototype.getProxiedData = function() {
	// We're using the proxy 
	var platform = TVEngine.getPlatform();
	if(platform && platform.proxy().length > 0 && this.method == "GET" ) {
		return null
	} else {
		return this.getParams();
	}
}