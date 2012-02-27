# Samsung sample Brightcove video player #

**By [Brightcove](http://brightcove.com) and [A Different Engine](http://adifferentengine.com)**

## Overview: ##
Sample app for jumpstarting Samsung SmartTV development.  While this application is primarily focused on the Samsung platform the code is portable enough that it should work with little modification on the GoogleTV browser and LG TVs as well.

_This is not meant to be a plug and play solution. Its meant to jump start developers on the Samsung Platform_

For more information check out the additional readme in js/Common/enginelite/README.markdown for more details on the associated framework.

_Neither Brightcove or A Different Engine Ensure this code to be bug free!_

### Skills Needed ###
The expectation is that this library is meant for developers familiar with existing front end web technologies. Users should be proficient in the following:

* HTML
* Javascript 
* CSS

In particular we use a few, common open source Javascript libraries. These include:

* [Jquery](http://jquery.com/)
* [Underscore](http://documentcloud.github.com/underscore/)
* [Backbone](http://documentcloud.github.com/backbone/)


### A Note on Local Setup

So this framework will support development in the browser, however browsers do not allow for the type of cross domain AJAX requests required for these types of apps (This is a security feature which the CE Devices relax).  In order to handle these we bounce our AJAX requests off of a local proxy written in PHP (See proxy.php). This means when you're writing your apps if you want to develop in browser (which we find desireable because of the more advanced debugging tools) this app needs to run in a "hosted" environment which supports php. This php proxy is not intended for use in production environments without additional security controls.

###Get your accounts and development environment ready###

* A Brightcove account (http://www.brightcove.com)
Sign up for an account for the Video Platform on Brightcove. Select the account that suits your content delivery needs. 
* A Samsung device or the Samsung SDK (PC ONLY) (http://www.samsungdforum.com/)
Sign up for an account and download the Samsung Smart TV SDK.  
* A Modern Web Browser Please note that the sample Brightcove video player is designed to work in modern versions of Firefox, Chrome and Safari for ease of development. Generally video playback in H.264/MP4 will not work on Firefox but generally has worked in Chrome.
* A Local Web Server if browser testing is required.



###Getting your content ready###

* Get a Brightcove customer token with read and URL access. This can be found under Account Settings > API Management
* Create a custom Brightcove player using one of the multi-playlist player templates. Make note of the ID number of this player. You will need it for configuration settings.
* Create at least one playlist for your Roku content. 
    Each playlist will appear as a category section in the Roku Application. 

###Configure the app###
* config.xml is documented in the [Samsung user guide](http://www.samsungdforum.com/Guide/View/Developer_Documentation/Samsung_SmartTV_Developer_Documentation_3.0/Getting_Started/Application_Development_Process/Implementing_Your_Application_Code/Coding_Your_JavaScript_Application), but you want to note the path to the icons for the application, the width and height of your target resolution, as well as the name of your application.
* application.js: There are Brightcove Configuration settings at the top of this page 
    + customerToken: your Brightcove customer token with read and URL access
    + playerID: this is the id of the custom player you created for your Samsung content

### Skin the app ###
* Icons
    + Player Icons: There are two sets of navigation icons for use, located in /images/navbar/black and /images/navbar/white. You can create new icons if you like as well. These are referenced in the control hints container on index.html
    + Application Icons: Application icons used in the Samsung Application manager are located in the /images/icons directory. These must be transparent png files. These are documented in the [Samsung user guide](http://www.samsungdforum.com/Guide/View/Developer_Documentation/Samsung_SmartTV_Developer_Documentation_3.0/Getting_Started/Application_Development_Process/Implementing_Your_Application_Code/Coding_Your_JavaScript_Application)
* Interface Images:
    + loading.png (/images/[resolution]/loading.png): This image appears as the application is loading. It is loaded in index.html and can be changed easily.
    + down_arrow.png, left_arrow.png, right_arrow.png, up_arrow.png (/images/[resolution]/): these images control the main navigation bar and can be remade to your needs.
    + logo.png (/images/[resolution]/logo.png): replace this image with your company logo
    + navbar_back.png (/images/[resolution]/navbar_back.png): this image appears behind the navigation controls on the video player page.
    + overlay.png (/images/[resolution]/overlay.png): This full-screen image provides the background for the navigation page.
    + pagingback.png (/images/[resolution]/pagingback.png): This image appears behind the paging element on the navigation page (i.e. 1 of 5)
    + playicon.png (/images/[resolution]/playicon.png): This image appears on rollover of a video thumbnail.
    + videoheader.png (/images/[resolution]/videoheader.png): This image appears at the top of the video player. Note: This image has a built-in progress bar.


## License ##
Copyright (c) 2012 Brightcove Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.