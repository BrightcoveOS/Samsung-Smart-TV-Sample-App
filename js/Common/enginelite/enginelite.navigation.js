/*
	Main Navigation Object, it does a few things
	
	1. Registers for key events.
	2. Enables and Disables Navigation
	3. Manages Menus
	
	
	TODO: The History stack is an incomplete implementation.
*/
TVEngine.Navigation = {
	enabled: true,
	_eventsIHandle: ['onright', 'onleft','onup','ondown','onselect', 'onred', 'onblue','onyellow', 'onback'],
	enable: function(){ 
		this.enabled = true;
		if(!this.currentMenu || !this.currentFocus ) return;
		this.currentMenu.fireItem(this.currentFocus.item, 'onFocus');
	}, 
	disable: function() { 
		this.enabled = false;
		if(!this.currentMenu || !this.currentFocus ) return;
		this.currentMenu.fireItem(this.currentFocus.item, 'onBlur');
	},
	
	start: function() {
		this.currentMenu.setFocused();
		this.enable();
	},
	
	// Register with the KeyHandler so we get key events.
	init: function() {
		$log("<<< INITIALIZING NAVIGATION >>>");
		TVEngine.KeyHandler.bind('all', this.eventHandler, this);
		if(!this.currentMenu) {
			if(this.defaultMenu) {
				this.currentMenu = this.defaultMenu;
			} else if (this.menus.length > 0 ) {
				this.currentMenu = this.menus[0];
			} else {
				throw "Can't init navigation, no menus have been added."
			}
			this.currentFocus = {
				menu: this.currentMenu, item: this.currentMenu.getDefaultItem()
			}
		}
	},
	
	menus: {}, currentFocus: null, currentMenu: null, defaultMenu: null,
	
	addMenu: function(menu) {
		if(!menu.name) throw "Can't add a menu to the navigation without a name";
		this.menus[menu.name] = menu;
		if(menu.defaultMenu) this.defaultMenu = menu;
	},
	
	bindToMenu: function(menuName, event, callback, context) {
		var menu = this.menus[menuName];
		if(!menu) return;
		menu.bind(menuName+":"+event, callback, context);
	},
	
	
	// Send the key event to the current menu.
	eventHandler: function(event) {
		var myevent = event.replace("keyhandler:", "");
		// instead of subscribing to each, we filter out the ones we dont' want.
		
		if (!_.include(this._eventsIHandle, myevent.toLowerCase())) return;
		if (!this.currentMenu && this.defaultMenu ) {
			this.currentMenu = this.defaultMenu;
		}
		if(this.enabled && this.currentMenu ) {
			this.currentMenu.fireItem(this.currentFocus.item, myevent);
		} else if(!this.currentMenu) {
			$error("<<< NO CURRENT MENU SET >>>");
		}
	},
	
	setFocus: function( menu,  item ) {
		$log(" Setting focus to " + menu + " / " + item);
		var item = this.menus[menu].mainOnly() ? "main":item;
		if(_.isNull(this.menus[menu]) || _.isNull(this.menus[menu].items[item]) ) {
			$error("<<< Tried to set menu to non-existant menu "+menu+" or non existant item "+menu+"/"+item+">>> ");
			return;
		} 
		// Note we don't add this until we leave it
		this.History.addItemToStack(this.currentFocus);
		
		var currentMenu = this.menus[this.currentFocus.menu.name];
		
		// First Blur the current stuff.
		// Menu *only* if menu changed.
		var newMenu = (this.currentFocus && menu != this.currentFocus.menu.name);
		
		currentMenu.fireItem(this.currentFocus.item, 'onBlur');
		if(newMenu) {
			$log(" Looks like menu changed, so blurring old menu ");
			currentMenu.fire("onBlur");
		}
		
		
		this.currentMenu = this.menus[menu];
		// only fire the main's onFocus if 
		if(newMenu || !this.currentMenu.mainOnly()) )  {
			$log("New Menu calling menu focus")
			this.currentMenu.fire("onFocus");
		}
		$log("Firing focus of new item: " + item);
		this.currentMenu.fireItem(item, "onFocus");
		this.currentFocus = {menu: currentMenu, item: item};
	},
	
	back: function() {
		var last = this.History.popLastItem();
		this.setFocus(last.menu, last.item);
	},
	
	History : {
		maxStackLength: 50, _stack: [], 
		addItemToStack: function(item) {
			if( this._stack.length == this.maxStackLength ) this._stack.shift();
			this._stack.push(item);
		},
		// Note this changes the stack.
		last: function() {
			return this._stack.pop();
		},
		clear: function() {
			this._stack = [];
		}
	}
}
/*
 TVEngine Menu Item.
*/

TVEngine.Navigation.Menu = function() {
	this._focused = false;
	this.items = {};
	this._main = false;
	this.defaultItem = null;
	_.extend(this, Backbone.Events);
}


TVEngine.Navigation.Menu.prototype.setFocused = function() {
	if(!this.focused) {
		this.fire("onFocus");
		this._focused = true
	}
}
TVEngine.Navigation.Menu.prototype.setBlurred = function() {
	if(this.focused) {
		this.fire("onBlur"); this._focused = false;
	}
}
TVEngine.Navigation.Menu.prototype.mainOnly = function() {
	return this._main;
}
TVEngine.Navigation.Menu.prototype.menuHandlesEvents = function() {
	this._main = true;
	this.items['main'] = {};
},

TVEngine.Navigation.Menu.prototype.getDefaultItem = function() {
	return this.defaultItem || _.first(_.keys(this.items))
}

TVEngine.Navigation.Menu.prototype.fire = function(handler, params) {
	if(handler == 'onFocus') {
		this._focused = true;
	} else if (handler == 'onBlur') {
		this._focused = false;
	}
	if(_.isFunction(this[handler])) {
		this[handler]();
	} 
};

TVEngine.Navigation.Menu.prototype.fireItem = function(item, handler, params) {
	if(this._main) {
		this.fire(handler, params);
		return;
	}
	if( this.items[item] && _.isFunction(this.items[item][handler])){
		this.items[item][handler].call(this,params);
	}
};