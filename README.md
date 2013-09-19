jquery.cssliveupdate
====================

## Description

**CssLiveUpdate** is a jQuery plugin to continually update the `style` attribute of an element with the CSS rules found in another element. It facilitates the creation of live CSS demos for conferences, courses, etc.

Typically, the source element is either a form field (`textarea`, `input` or `select`) or a regular element with the `contenteditable` attribute set.

## Setup

To use it, first load jQuery and the CssLiveUpdate plugin:

```
<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
<script src="js/jquery.cssliveupdate.js"></script>
```

Then, simply assign a jQuery selector to the `data-cssliveupdate-target` attribute of the element containing the CSS rules that will be modified. This selector should point to the element(s) that will have its `style` attribute updated:

```
<textarea data-cssliveupdate-target="#demo">a {color: red;}</textarea>
<div id="demo">This div will have it's "style" attribute modified!</div>
```

All fields with `data-cssliveupdate-target` defined are automatically updated. If you prefer, you can alternatively manually activate or deactivate the live update:

```
$("#some-source-element").cssLiveUpdate("activate", "some-target-element");
$("#some-source-element").cssLiveUpdate("deactivate");
```

## Browser support

CssLiveUpdate has been tested and known to work on : 

* Safari 6 (Mac)
* Firefox 23 (Mac)
* Chrome 29 (Mac, Win)
* Internet Explorer 10 (Win)

Let me know if you test it on other platforms so I can add them here.

## Demo

You can view and try out a live demo at this address http://cote.cc/projects/cssliveupdate

## Requirements

* [jQuery](http://jquery.com/) v. ???


## License

To be completed.
