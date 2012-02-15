# The Simple TVEngine.

This is a reduced set of version 2 of A Different Engine's TV App libraries.  We tried to create something thats pretty simple and highly modular and event based.  

## Cross Platform

One of the primary design characteristics of this library is the idea of making these apps as cross platform as possible. The primary differences across platforms are screen resolutions and key mappings.

## Dependencies 

There are 3 Code library dependencies. 

1. Jquery (1.4.2)
1. Backbone/Underscore (Underscore is a Backbone Dependency)

If you need AJAX requests to be proxied you will need to host this on a machine which supports PHP. We generally run this on a local apache instance. For devices like the browser which does not provide cross domain AJAX we have a simple PHP based proxy which we bounce requests off of. This php proxy is not meant to be used in production without additional security constraints.

Finally when a user 
## Code Structures
Code organization

### Core
* js/Common/enginelite - core TV Engine files
* js/Common/enginelite/advendors - AD Vendor Libaries (Engine Code, written by app author, vendor supplied code should go in js/Common/vendor
* js/Common/enginelite/mediaplayers - Various types of media players, will generally be platform specific. Right now we have HTML5 and the Samsung SmartTV player supported
* js/Common/enginelite/platforms - Various Supported platforms. Right now we support the "browser" and Samsung, Right now we're breaking Samsung into 2 categories "Low" and "High" Low are 2009 TVs.

### Other Libaries
* js/Common/vendor - 3rd party libraries
* js/Common/jqplugins - JQuery plugins

### User Code
js/application.js - Main Application Code
js/menus/*.js- User Menus

## How To Browse This Code
The main TVEngine.js file is a good place to start, it really doesn't do much however except load all the related modules. This is meant to be a pretty modular system so you don't need *everything* for all projects.

The primary place you may run into issues is in the Navigation file.  This is the meat of the engine.  There are two primary things in here the "Navigation" singleton object and the "Menu" class.

After that the rest is up to you. The MediaPlayer codes may cause some issues. The idea here is to normalize media playback across various implemenations.

## Events, Events, Events.
This framework uses a lot of events that can be listened to to handle user input or state changes. For more information on this system please check http://documentcloud.github.com/backbone/#Events.

The main ones are 

1. _TVEngine_ - *tvengine:appready*  this indicates that all the necessary files have been loaded and the app should be ready to go.  This is important if you have data or ajax dependencies you need to wait for. 
1. _TVEngine.KeyHandler_ - *[ see list in enginelite.keyhandler.js ]* - The Key handler component has a list of all available key events which can be subscribed
1. _TVEngine.MediaPlayer_ *[a lot and not really documented]* - The MediaPlayer has a variety of events which can occur around media playback.
1. _TVEngine.DataLoader_

## Understanding How Remote Navigation Works
This is the basics of the TVEngine's navigation system.

### Key Handling
Navigation is pretty simple. Keys are consumed via the TVEngine.Keyhandler object. They are then translated to "events" common events are "onUp", "onDown","onRight","onLeft" and "onSelect".  Users can subscribe directly to the keyhandler's evets to handle key presses if desired. These use the Backbone event convention. One note there is not currently a way to manage event bubbling or order of event firing.  We detect "keydown" events. We also send corresponding "keyup" events so for a select event a "onSelect" and "onSelectUp" event will be sent.

### Menus and Items
The way navigation works is that an application is a collection of menus. Each menu has a collection of items.  You can navigate from item to item within a menu or from menu to menu/item.  Every menu item must register what happens with focus onLeft/onRight/onUp/onDown (if something changes).  To switch focus call TVEngine.Navigation.setFocus(menu, item). When focus switches from item to item the old item's onBlur handler and the new Item's onFocus handler will be called. When focus switches from menu to menu both the item focus/blur handlers are called as well as the menus onBlur and onFocus handlers.

#### Sample Menu

See js/menus/enginelite.samplemenus.js for samples. There are two samples here. The first is a regular Menu with items. We also ran into a lot of scenarios where we'd only have a single menu item, though you could select from a collection of choices. A grid of DVD boxart is a good sample where we have a single Menu Item but keep track of an X and Y position in order to determine what currently has focus.

## Media Player

We attempt abstract out much of the media player details into platform specific libraries.  Right now we support the Native Samsung player and an HTML5 Player. We may add support for a Flash player at some point.

## Data Loader

We have a few methods for helping with dependencies around data. To that effect we have the ability for data to be loaded serially or via a waterfall method and begin loading all data at once with a callback once all the data is loaded.
## Scene Handling

*Coming Soon!!*

