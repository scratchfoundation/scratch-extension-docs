---
title: 'Scratch Extensions'
tagline: 'Extensions for Scratch 2.0'
layout: default
---
# Contents

1. [Introduction](#intro)
1. [Writing Extensions for Scratch 2.0](#writing-extensions-for-scratch-20)
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
   1. [Editor Interface](#editor-interface)

# Introduction

For information about Scratch 2.0 HTTP extensions please see [this page](http://wiki.scratch.mit.edu/wiki/Scratch_Extension_Protocol_(2.0)#HTTP_Extensions). **In this document the word _extension_ will only refer to Scratch 2.0 Javascript Extensions.**

Javascript extensions let you create any kind of block you can find in the Scratch language. Need to delay? They can do that too. As you may expect, extensions have access to web browser APIs. We even added an API for extensions to communicate with serial and HID hardware. This API requires a [web browser plugin](http://scratch.mit.edu/scratchr2/static/ext/download.html) to use online but the offline editor will have it built-in (on Mac and Windows) with the next release.

With the updates to Scratch in August 2014, extensions are now uploaded to and loaded from the Scratch servers. However, when creating an extension, your code will be initially loaded from a local file before being uploaded to the server and accessible by projects. With these updates developers now have control over their uploaded extensions in the _Extension Library_. From there developers can create, update, or download their extensions.

For more information about the editor updates see [Editor Interface](#editor-interface). We've created a [forum](http://scratch.mit.edu/discuss/41/) on Scratch for approved developers to discuss extensions, ask questions, and make suggestions.

# Writing Extensions for Scratch 2.0

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

### Editor Interface
_A demonstration of the interface and workflow can be viewed [here](https://www.youtube.com/watch?v=PLU7enk1tJ0)._

Scratchers with access to the extension development UI will see new options in the _Extension Library_ window and the extension drop-down menus. In the _Extension Library_ there is a button called _My Extensions_ which will load a list of the user's own extensions. The first item in this list is an option for creating a new extension.

![](https://raw.githubusercontent.com/LLK/scratch-extension-docs/gh-pages/images/add_ext_win.png)

Extensions can be in three states while editing them. Before a new extension is first uploaded to the Scratch servers, the extension menu looks like this:

![](https://raw.githubusercontent.com/LLK/scratch-extension-docs/gh-pages/images/new_ext_menu.png)

When editing an extension, the editor will load and watch (we call it 'connecting' to a file) a local file. This allows the editor to detect changes to the file and display a reload button when changes are available for loading. These are the options for an extension that has been saved to the server and is still connected to a local file:

![](https://raw.githubusercontent.com/LLK/scratch-extension-docs/gh-pages/images/saved_ext_menu.png)

Lastly, here are the options for an extension that has been loaded with a project but is not connected to a local file:

![](https://raw.githubusercontent.com/LLK/scratch-extension-docs/gh-pages/images/loaded_ext_menu.png)


