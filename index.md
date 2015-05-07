---
title: 'Scratch Extensions'
tagline: 'Extensions for Scratch 2.0'
layout: default
---
# Contents

1. [Introduction](#introduction)
1. [Using ScratchX](#using-scratchx)
   1. [Link to JavaScript file](#link-to-a-js-file-on-github)
   1. [Open an SBX file](#open-an-sbx-file)
   1. [Open a ScratchX link](#open-a-scratchx-link)
1. [Writing Extensions for ScratchX](#writing-extensions-for-scratchx)
   1. [Adding Blocks](#adding-blocks)
      1. [Command blocks](#command-blocks)
      1. [Command blocks that wait](#command-blocks-that-wait)
      1. [Reporter blocks](#reporter-blocks)
      1. [Reporter blocks that wait](#reporter-blocks-that-wait)
      1. [Hat blocks](#hat-blocks)
   1. [The Extension Descriptor](#the-extension-descriptor)
      1. [Blocks](#blocks)
      1. [Menus](#menus)
      1. [URL](#url)
   1. [Hardware Support](#hardware-support)
      1. [USB HID Support](#usb-hid-support)
      1. [Serial Device Support](#serial-device-support)
1. [Sharing Extensions](#sharing-extensions)
1. [Developer FAQ](#developer-faq)
 

# Introduction

ScratchX is a platform that enables people to test experimental functionality built by developers for the visual programming language [Scratch](https://scratch.mit.edu). This experimental functionality, which we call Experimental Extensions, makes it possible for Scratch to interface with external hardware and information outside of the Scratch website through new blocks. Some Experimental Extensions enable Scratch to connect with physical hardware, such as robots or programmable devices. Other Experimental Extensions connect web-based data and services to Scratch, such as weather data or text-to-speech services. Extensions are written in JavaScript for the online ScratchX project editor.

This documentation serves as a guide for developers who want to create Experimental Extensions for Scratch and run them on the ScratchX platform. If you are not a developer and have have questions about using ScratchX or Experimental Extensions, please read our [FAQ for non-developers](scratchx.org/faq) *missing. If you are looking for Official Extensions within Scratch, such as the LEGO WeDo, you can learn more about Scratch 2.0 extensions on the [Scratch Wiki](http://wiki.scratch.mit.edu/wiki/Scratch_Extension). 

( For information about Scratch 2.0 HTTP extensions please see [this page](http://wiki.scratch.mit.edu/wiki/Scratch_Extension_Protocol_(2.0)#HTTP_Extensions). In this document the word extension will only refer to Scratch 2.0 Javascript Extensions. )

# Using ScratchX

The ScratchX interface is very similar to the Scratch 2.0 interface with the exception of a set of features for loading Experimental Extensions. You can load your extension into ScratchX in the following ways:

## Link to a .JS file on Github

ScratchX does not host JavaScript extensions. Instead, we provide a way to link ScratchX to a publicly-hosted JS file. 

In order to link a .JS file, you must first put your file on to Github, a web-based Git repository hosting service. This requires you set up a [Github](http://github.com) account if you don’t already have, and push your JS file to a [Github page](https://pages.github.com/).

_Need information about crossdomain.xml here, and encourage people to think about backwards compatibility_

Next, to link ScratchX to your hosted file, right-click or shift-click on the ‘Load Experimental Extension’ from within the ‘More Blocks’ category in the blocks menu:

![](https://raw.githubusercontent.com/LLK/scratch-extension-docs/scratchx/images/link_to_js_menu.png)

This launches a dialogue that prompts you to link to your Github page. You’ll need to copy the link to your publicly-hosted JS file on Github and then paste it into the box on the dialogue:

![](https://raw.githubusercontent.com/LLK/scratch-extension-docs/scratchx/images/link_to_github.png)

## Open an SBX File

You can load an SBX (.sbx) file that contains a pointer to your extension from the homepage directly through this element:

![](https://raw.githubusercontent.com/LLK/scratch-extension-docs/scratchx/images/open_ext_files.png)

The same dialogue can be launched from within Scratch by clicking on the green ‘Load Experimental Extension’ in the top right or from within the ‘More Blocks’ section of the blocks menu:

![](https://raw.githubusercontent.com/LLK/scratch-extension-docs/scratchx/images/load_ext_buttons.png)

For help on creating SBX files / projects with pointers to Github-hosted JS files, see our [documentation on sharing here](#sharing-extensions).

## Open a ScratchX link

Developers who have hosted their extensions (.js file) or sample projects (.sbx file) on Github can create a ScratchX url that points directly to their extension. This link can then be shared with the public.  Learn how to generate the ScratchX link later on in [this documentation](#sharing-extensions). 

Users can then visit that URL directly in their browsers or enter it into the homepage element on ScratchX.org:

![](https://raw.githubusercontent.com/LLK/scratch-extension-docs/scratchx/images/open_ext_url.png)

# Writing Extensions for ScratchX

Writing a Javascript extension for Scratch 2.0 starts with some boilerplate code, which looks like the following:

```javascript
(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
        ]
    };

    // Register the extension
    ScratchExtensions.register('Sample extension', descriptor, ext);
})({});
```

## Adding Blocks

An extension may define a number of blocks, of different types (e.g. a command block, or a hat block, or a reporter block). Blocks can take in parameters.

### Command blocks

To add a simple _command_ block, there needs to be an entry in the ``descriptors.blocks`` list, and a corresponding function for it. The simplest block possible is shown below (it does nothing).

```javascript
(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.my_first_block = function() {
        // Code that gets executed when the block is run
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            [' ', 'my first block', 'my_first_block'],
        ]
    };

    // Register the extension
    ScratchExtensions.register('My first extension', descriptor, ext);
})({});
```

### Command blocks that wait

Sometimes it is necessary to have a command block that waits (e.g. if a block plays a sound, it may be a good idea to wait till the sound playback finishes). The sample extension below implements a "random wait" block to show how that can be done. Note the use of the ``console.log`` statement in the code - most Javascript methods, as well as [jQuery](http://jquery.com/) methods will work fine in an extension.

```javascript
(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    // Functions for block with type 'w' will get a callback function as the 
    // final argument. This should be called to indicate that the block can
    // stop waiting.
    ext.wait_random = function(callback) {
        wait = Math.random();
        console.log('Waiting for ' + wait + ' seconds');
        window.setTimeout(function() {
            callback();
        }, wait*1000);
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['w', 'wait for random time', 'wait_random'],
        ]
    };

    // Register the extension
    ScratchExtensions.register('Random wait extension', descriptor, ext);
})({});
```

### Reporter blocks

Blocks can also return values, and they are called _reporter_ blocks. The corresponding JavaScript function for a reporter block needs to return a value, as shown in the example below (note that this example also shows how to make blocks accept parameters).

```javascript
(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.power = function(base, exponent) {
        return Math.pow(base, exponent);
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name, param1 default value, param2 default value
            ['r', '%n ^ %n', 'power', 2, 3],
        ]
    };

    // Register the extension
    ScratchExtensions.register('Sample extension', descriptor, ext);
})({});
```

### Reporter blocks that wait

One common use-case for reporter blocks is getting data from online web-services, where the blocks need to wait for the web-api call to complete. The following example shows how to fetch the current temperature of a city using an AJAX call to [Open Weather Map API](http://openweathermap.org/API). Note that the block type is _R_ instead of _r_ (which is for a non-blocking reporter).

```javascript
(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.get_temp = function(location, callback) {
        // Make an AJAX call to the Open Weather Maps API
        $.ajax({
              url: 'http://api.openweathermap.org/data/2.5/weather?q='+location+'&units=imperial',
              dataType: 'jsonp',
              success: function( weather_data ) {
                  // Got the data - parse it and return the temperature
                  temperature = weather_data['main']['temp'];
                  callback(temperature);
              }
        });
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['R', 'current temperature in city %s', 'get_temp', 'Boston, MA'],
        ]
    };

    // Register the extension
    ScratchExtensions.register('Weather extension', descriptor, ext);
})({});
```

### Hat blocks

Hat blocks go on top of block stacks - examples of Scratch hat blocks include "when green flag clicked" or "when this sprite clicked". To create a hat block through an extension, the block type needs to be set to _h_, as shown in the example below.

```javascript
(function(ext) {
    var alarm_went_off = false; // This becomes true after the alarm goes off

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.set_alarm = function(time) {
       window.setTimeout(function() {
           alarm_went_off = true;
       }, time*1000);
    };

    ext.when_alarm = function() {
       // Reset alarm_went_off if it is true, and return true
       // otherwise, return false.
       if (alarm_went_off === true) {
           alarm_went_off = false;
           return true;
       }

       return false;
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['', 'run alarm after %n seconds', 'set_alarm', '2'],
            ['h', 'when alarm goes off', 'when_alarm'],
        ]
    };

    // Register the extension
    ScratchExtensions.register('Alarm extension', descriptor, ext);
})({});
```

## The Extension Descriptor

The extension descriptor can be used for more than just listing the blocks offered by your extension. Here is an example of a more complex descriptor:
```javascript
var descriptor = {
    blocks: [
        ['w', 'turn motor on for %n secs',             'motorOnFor', 1],
        [' ', 'turn motor on',                         'allMotorsOn'],
        [' ', 'turn motor off',                        'allMotorsOff'],
        [' ', 'set motor power %n',                    'startMotorPower', 100],
        [' ', 'set motor direction %m.motorDirection', 'setMotorDirection', 'this way'],
        ['h', 'when distance %m.lessMore %n',          'whenDistance', '<', 20],
        ['h', 'when tilt %m.eNe %n',                   'whenTilt', '=', 1],
        ['r', 'distance',                              'getDistance'],
        ['r', 'tilt',                                  'getTilt']
    ],
    menus: {
        motorDirection: ['this way', 'that way', 'reverse'],
        lessMore: ['<', '>'],
        eNe: ['=','not =']
    },
    url: 'http://info.scratch.mit.edu/WeDo'
};
```

### Blocks

The blocks property is an array of block definitions. Each block definition is an array of three or more items.  The required items are: op code, formatted label, and method name. These may optionally be followed by default block argument values.

The full list of block types available to an extension is as follows. Note that any operation that will run for more than a few milliseconds or will wait for an external event should be run asynchronously, as described above in the [Reporter blocks that wait](#reporter-blocks-that-wait) and [Command blocks that wait](#command-blocks-that-wait) sections.

| Op Code | Meaning
| ------- | -------
| `' '` (space) | Synchronous command
| `'w'`   | Asynchronous command
| `'r'`   | Synchronous reporter
| `'R'`   | Asynchronous reporter
| `'h'`   | Hat block (synchronous, returns boolean, true = run stack)

Each block argument is identified by a `%` character and the character following it specifies the type.  The types are: `%n` for number, `%s` for string, and `%m` for menu.  Menus also identify which menu to use with a period and the name of the menu like this: `%m.menuName`.

### Menus

The `menus` property is an object whose properties define the menus used by block arguments in the extension.  The property name is the menu name as it is used in the block definition(s). The property value is an array of options to display in the menu dropdown interface in Scratch.

For example, the `setMotorDirection` block in the example above includes `%m.motorDirection`, which will cause it to display a menu with `'this way'`, `'that way'`, and `'reverse'` as options.

### URL

The `url` property refers to a web page which describes the extension. Ideally, this page would describe each block, give examples, and identify any hardware or software required to use the extension. If the user clicks the `'About [extension name]...'` menu item within Scratch, this is the URL that will be opened.

## Hardware Support

Scratch provides its own set of APIs in order to allow extensions to access certain types of hardware. Currently, Scratch extensions may access the following types of hardware:
- Serial devices such as the PicoBoard
- USB HID devices such as joysticks or the LEGO WeDo

Extensions that request hardware access are required to implement two additional methods on the extension instance: `_deviceConnected()` and `_deviceRemoved()`. Both methods receive a device instance. To use the integrated hardware functions of the Scratch Extension API you pass the hardware information in the registration call:
```javascript
ScratchExtensions.register('Example Name', descriptor_object, ext_instance[, hardware_info]);
```

The `_getStatus()` method of your extension can be used to indicate whether your extension has successfully communicated with a hardware device. For example:
```javascript
ext._getStatus = function() {
    if(!device) return {status: 1, msg: 'Device not connected'};
    return {status: 2, msg: 'Device connected'};
}
```

The value returned by `_getStatus()` corresponds to the color of the status 'light' in Scratch and indicates the general state of your extension. The `msg` property can be used to provide more specific information.

| Value | Color  | Meaning   |
| ----- | ------ | --------- |
| 0     | red    | error     |
| 1     | yellow | not ready |
| 2     | green  | ready     |

The details of the `hardware_info` parameter and the `_deviceConnected()` and `_deviceRemoved()` methods are described below in sections specific to each type of device.

*_API Note: The hardware API is still somewhat experimental and may change in the future. In particular, we will soon be making a change to methods that return hardware data, such as `read()` for HID devices: these methods will take a callback in instead of returning data directly. This change is necessary to improve compatibility and allow us to expand the variety of environments in which hardware extensions are available._*

### USB HID Support
_An example HID device extension is available [here](https://github.com/LLK/scratch-extension-docs/blob/master/joystickExtension.js)._
_More information about the HID protocol is available [here](http://www.usb.org/developers/devclass_docs/HID1_11.pdf)._

To let the extension system know that your extension is interested in USB HID devices, pass an object like this for the `hardware_info` parameter of the `register()` method:
```javascript
var hid_info = {type: 'hid', vendor: 0x0694, product: 0x0003};
ScratchExtensions.register('Example', descriptor, ext, hid_info);
```
The `vendor` and `product` values indicate the USB vendor and product ID of the device your extension supports. These values are frequently expressed as four-digit hexadecimal values, as indicated with the `0x` prefix in the JavaScript above.

If a device is connected with matching vendor and product IDs, Scratch will call the `_deviceConnected()` method on your extension and pass an object representing that device. Your `_deviceConnected()` method should keep track of the device object and set up communication as necessary for your needs. For example, this will start polling the device for new HID data every 20 milliseconds:
```javascript
var poller = null;
ext._deviceConnected = function(dev) {
    if(device) return;

    device = dev;
    device.open();

    poller = setInterval(function() {
        rawData = device.read();
    }, 20);
};
```

Once a connection to your device is established, your extension may use the `read()` and `write()` methods on the device object to communicate with it. These methods use [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays) objects to contain data being sent or received.
* `device.read(48)` will attempt to read 48 bytes of data and return an ArrayBuffer containing any data successfully read. Note that one packet of HID data is 48 bytes. *_This method is likely to change soon. See the API Note above._*
* `device.write(buffer)` will send the given ArrayBuffer's data to the device.

Your extension will also be notified if a matching device is disconnected, allowing your extension a chance to stop communication:
```javascript
ext._deviceRemoved = function(dev) {
    if(device != dev) return;
    if(poller) poller = clearInterval(poller);
    device = null;
};
```

Finally, your extension's `_shutdown()` method will be executed when the extension itself is shut down. For example:
```javascript
ext._shutdown = function() {
    if(poller) poller = clearInterval(poller);
    if(device) device.close();
    device = null;
}
```

### Serial Device Support
_An example serial device extension is available [here](https://github.com/LLK/scratch-extension-docs/blob/master/picoExtension.js)._

To let the extension system know that your extension is interested in serial devices, pass an object like this for the `hardware_info` parameter of the `register()` method:
```javascript
var serial_info = {type: 'serial'};
ScratchExtensions.register('Example', descriptor, ext, serial_info);
```

Your extension's `_deviceConnected()` method will be called for each serial port present on the computer. Your extension is responsible for checking if a suitable device is attached to that port and continuing on to the next port if necessary. Do not assume that the first time Scratch calls your `_deviceConnected()` will correspond to your device's serial port. The PicoBoard extension shows an example of how to deal with this situation: if no valid PicoBoard communication is received on a given port withing a particular timeout, the extension assumes that there is no PicoBoard on that port and continues scanning to the next port.
```javascript
var potentialDevices = [];
ext._deviceConnected = function(dev) {
    potentialDevices.push(dev);

    if (!device) {
        tryNextDevice();
    }
}
```

To communicate with a given serial port, your extension should open it with whichever options are appropriate for your device. These parameters are based on [Boost.Asio's serial port options](http://www.boost.org/doc/libs/1_50_0/doc/html/boost_asio/reference/serial_port_base.html). For a PicoBoard:
```javascript
device.open({ stopBits: 0, bitRate: 38400, ctsFlowControl: 0 });
```
The full set of options available for a serial port are as follows:

| Option         | Default | Valid values | Description
| -------------- | ------- | ------------ | -----------
| bitRate        | 9600 | Any valid baud rate | Up to  The bit (or baud) rate at which to communicate.
| bufferSize     | 4096 | Up to 8192 | The maximum amount of data that can be received at a time.
| ctsFlowControl | 1 (software) | 0 (none), 1 (software), 2 (hardware) | The type of flow control to use.
| dataBits       | 8 | 5, 6, 7, 8 | The number of data bits per character.
| parityBit      | 0 (none) | 0 (none), 1 (odd), 2 (even) | Whether and how to use the parity bit in each character.
| stopBits       | 1 (1.5 bits) | 0 (1 bit), 1 (1.5 bits), 2 (2 bits) | The number of stop bits per character.

Once a connection to your device is established, your extension may use the `send()` method to send data to your device, and the `set_receive_handler()` method to register a function to handle received data. These methods use [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays) objects to contain data being sent or received.
* `device.send(buffer)` will send the given ArrayBuffer's data to the device.
* `device.set_receive_handler(myReceiveHandler)` will result in `myReceiveHandler(buffer)` being called any time Scratch receives data from the device. Your receive handler will be supplied an ArrayBuffer containing the received data.

Your extension will also be notified if a device is disconnected, allowing your extension a chance to stop communication:
```javascript
ext._deviceRemoved = function(dev) {
    if(device != dev) return;
    if(poller) poller = clearInterval(poller);
    device = null;
};
```

Finally, your extension's `_shutdown()` method will be executed when the extension itself is shut down. For example:
```javascript
ext._shutdown = function() {
    if(poller) poller = clearInterval(poller);
    if(device) device.close();
    device = null;
}
```

# Sharing Extensions

ScratchX does not host JavaScript extensions. Instead, we provide a way to link ScratchX to a Github-hosted JavaScript extension. ScratchX can also point to a Github-hosted project file (.sbx) that in turn points to a Github-hosted JavaScript (.js) file. This is particularly useful if you’d like to share a demo project that makes use of an experimental extension.

The first step is to set up a [Github account](https://github.com/) if you don’t already have one, and push your JS file and/or SBX file to a [Github page](https://pages.github.com/).

Next, paste the public URL of your JavaScript (.js) and/or project (.sbx) file into the URL generator below:

_Need to create this for the public!_


Clicking on this URL will open a Scratch editor with your extension and/or project data loaded from Github. You can now share that link with the world!


# Developer FAQ

##What is ScratchX? 
ScratchX is a platform that enables people to test experimental functionality built by developers for the visual programming language [Scratch](#https://scratch.mit.edu). 

##What’s the difference between Scratch and ScratchX? 
[Scratch](#https://scratch.mit.edu) is a programming language and online community where you can create your own interactive stories, games, and animations. ScratchX is a separate experimental platform built to test experimental Scratch features, also known as Experimental Extensions. There is no login or community component to ScratchX, and projects created within ScratchX can only be run on ScratchX. 

##What are Scratch Extensions?
Scratch extensions make it possible for Scratch to interface with external hardware and information outside of the Scratch website through new blocks. Extensions are written in JavaScript for the ScratchX project editor.

##What is the difference between Experimental and Official Extensions?
Experimental Extensions are extensions created for Scratch by the community; they are not managed or endorsed by Scratch in any way. Experimental Extensions can run only in the ScratchX environment. Official Extensions can be found and run from within Scratch 2.0 (both [online](#https://scratch.mit.edu) and [offline](#https://scratch.mit.edu/scratch2download/_) editors), accessible in the ‘More Blocks’ section of the blocks menu. 

##How can I make my extension Official? 
At this time, we’re focused on building a library of Experimental Extensions on the ScratchX platform. We plan to work with developers over time to bring many of these Experimental Extensions into Scratch as official extensions. If you’d like to suggest your extension be highlighted on ScratchX, please email us at: scratch-extensions@media.mit.edu

##What are the criteria for being added to the ScratchX library?
Here are some of the criteria we’ll be using to decide whether or not to add an extension to the library:

* Security
* Ease of Use
* Quality (documentation, design, code)
* Requirements (browsers, operating system, hardware, etc)
* Content (age-appropriate, copyright infringement)

##Where can I find example Experimental Extensions to play around with?
We have linked to a few example extensions on the [ScratchX](#http://scratchx.org) homepage. We plan to highlight additional extensions in the coming months in a ScratchX library.

##Who can make an extension?
Developers with a [GitHub](#https://github.com) account and a knowledge of JavaScript can create and test Experimental Extensions on ScratchX. To learn more about how to make extensions, see our [documentation here](#writing-extensions-for-scratchx)

##How do I create a Scratch extension?
You can learn more about how to create a Scratch extension [in our documentation here](#sharing-extensions)

##How do I share my Experimental Extensions?
The easiest way to share your experimental extension is to create a scratchx.org url that points to your extension (hosted on GitHub). You can learn more about [sharing your extension here](#sharing-extensions). 

##Why can’t I open .sbx files in Scratch 2.0 or the offline editor?
Experimental Extensions are extensions created for Scratch by the community and are not managed or endorsed by Scratch in any way. Because of this, we do not allow Experimental Extensions to run on the larger Scratch site. 

##I’m having trouble creating my extension - where can I get help?
Once you’ve published your code on Github, post a link to it in the [Scratch extension developers forum](#http://scratch.mit.edu/discuss/41/) asking other developers for help.

##What is going to happen to the older Experimental Extension tools in Scratch 2.0? 
We plan to phase out the older Experimental Extensions platform on Scratch 2.0 at the end of November 2015. We encourage everyone to migrate their extensions out of Scratch 2.0 and into GitHub for use in ScratchX before November 2015. 

##How do I request new features or submit bugs?
We would love to hear your thoughts and suggestions. Submit them as issues here on our [GitHub repository](#https://github.com/LLK/scratchx/issues).

