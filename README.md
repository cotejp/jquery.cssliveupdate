jquery.cssliveupdate
====================

WARNING: THIS PLUGIN HAS NOT BEEN TESTED ENOUGH TO BE CONSIDERED PRODUCTION-READY (HENCE THE ALPHA VERSION). USE AT YOUR OWN RISK. MEANWHILE, YOU ARE WELCOME TO SEND ME COMMENTS, SUGGESTIONS AND BUG REPORTS.

## Description

**CssLiveUpdate** is a jQuery plugin to continually update the `style` attribute of an element with the CSS rules found in another element. It facilitates the creation of live CSS demos for conferences, courses, etc.

Typically, the source element is either a form field (`textarea`, `input` or `select`) or a regular element with the `contenteditable` attribute set.

## Demo

You can view and try out a live demo at this address http://cote.cc/projects/cssliveupdate

## Setup

To use it, first load jQuery and the CssLiveUpdate plugin:

```html
<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
<script src="js/jquery.cssliveupdate.js"></script>
```

Then, simply assign a jQuery selector to the `data-cssliveupdate-target` attribute of the element containing the CSS rules that will be modified. This selector should point to the element(s) that will have its `style` attribute updated:

```html
<textarea data-cssliveupdate-target="#demo">a {color: red;}</textarea>
<div id="demo">This div will have it's "style" attribute modified!</div>
```

All fields with `data-cssliveupdate-target` defined are automatically updated. If you prefer, you can alternatively manually activate or deactivate the live update:

```javascript
$("#some-source-element").cssLiveUpdate("activate", "some-target-element");
$("#some-source-element").cssLiveUpdate("deactivate");
```

## Browser support

CssLiveUpdate has been tested and known to work on : 

* Safari 6 (Mac)
* Firefox 23 (Mac)
* Chrome 29 (Mac, Win)
* Internet Explorer 10 (Win)

Let me know if you test it on other/older browsers and platforms so I can add them here.

## Requirements

* [jQuery](http://jquery.com/): only version 2.0.3 has been tested so far. If you test it on other versions, let me know so I can lower the minimum version.

## Reporting an Issue

1. Before reporting, make sure you have the latest version.
2. Make sure the problem you are reporting is reproducible. Use http://jsbin.com to provide an example page.
3. Indicate what browser(s) the issue can be reproduced in. **Note: IE Compatibilty modes issues will not be addressed.**

## License

To be completed.
