jquery.cssliveupdate
====================

WARNING: THIS PLUGIN HAS NOT BEEN TESTED ENOUGH TO BE CONSIDERED PRODUCTION-READY (HENCE THE ALPHA VERSION DESIGNATION). USE AT YOUR OWN RISK. MEANWHILE, YOU ARE WELCOME TO SEND ME COMMENTS, SUGGESTIONS AND BUG REPORTS.

## Description

**CssLiveUpdate** is a jQuery plugin to continually update the `style` attribute of an element with the CSS rules found in another element. It facilitates the creation of live CSS demos for conferences, courses, etc.

Typically, the source element is a form field (`textarea`, `input` or `select`) or a regular element with the `contenteditable` attribute set (although this is not mandatory).

## Demo

You can view and try out a live demo at this address http://cote.cc/projects/cssliveupdate

## Setup

To use it, first load jQuery and the CssLiveUpdate plugin:

```html
<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
<script src="js/jquery.cssliveupdate.js"></script>
```

Then, identify the element(s) containing the CSS rules you want to apply elsewhere. On those elements, add a `data-cssliveupdate-target` attribute. This attribute should contain a jQuery selector string to target the element whose `style` attribute will be updated:

```html
<textarea data-cssliveupdate-target="#demo">a {color: red;}</textarea>
<div id="demo">This div will have it's "style" attribute modified!</div>
```

In this case, the `#demo` element's `style` attribute will be assigned the content of the `textarea` (after some CSS clean up is performed).

At init, all elements with the `data-cssliveupdate-target` attribute are automatically parsed and their target updated. 

If you prefer to do it manually, do not use the `data-cssliveupdate-target` attribute and instead call CssLiveUpdate with the `activate` or `deactivate` keywords yourself:
```javascript
$("#source-element").cssLiveUpdate("activate", "target-element");
$("#source-element").cssLiveUpdate("deactivate");
```

## Browser support

CssLiveUpdate has been tested and known to work on : 

* Safari 6 (Mac)
* Firefox 23 (Mac)
* Chrome 29 (Mac, Win)
* Internet Explorer 10 (Win)

Let me know if you test it on other/older browsers and platforms so I can add them here.

## Requirements and dependencies

* **Mandatory**: [jQuery](http://jquery.com/) 1.7.2 or above
* Optional: [Highlight.js](http://softwaremaniacs.org/soft/highlight/en/) (for CSS source syntax coloring)

If you decide to install [Highlight.js](http://softwaremaniacs.org/soft/highlight/en/) for CSS syntax highlighting, you will need to add the following lines (or similar) to the HTML file:

```html
<link rel="stylesheet" href="styles/default.css">
<script src="highlight.pack.js"></script>
<script>hljs.initHighlightingOnLoad();</script>
```

This will automatically highlight all code on the page that is included in a  `<pre><code>...</code></pre>` block. To be safe, add the `css` class to the `code` tag so it knows which syntax is used:

```css
<pre><code class="css">
a { 
  color: red; 
}
</code></pre>
```

## Reporting an Issue

1. Before reporting, make sure you have the latest version.
2. Make sure the problem you are reporting is reproducible. Use http://jsbin.com to provide an example page.
3. Indicate what browser(s) the issue can be reproduced in. **Note: IE Compatibilty modes issues will not be addressed.**

## License

To be completed.
