jquery.cssliveupdate (v0.7a)
====================

>WARNING: THIS PLUGIN HAS NOT BEEN TESTED ENOUGH TO BE CONSIDERED PRODUCTION-READY YET (HENCE THE ALPHA VERSION DESIGNATION). USE AT YOUR OWN RISK. MEANWHILE, YOU ARE WELCOME TO SEND ME COMMENTS, SUGGESTIONS AND BUG REPORTS.

## Description

**CssLiveUpdate** updates the page's CSS styles with the textual content of the HTML element(s) it's watching. This makes it very easy to create a CSS demo page where any CSS typed into a form field is added in the `<head>` of the page via a `<style class="cssliveupdate">` tag. It is meant to be used for CSS demos, classes, conferences, etc.

The elements being watched are typically form elements (`<textarea>` or `<input>`) or any regular element bearing the `contenteditable` attribute.

## Demo

A simple demo is included in the demo folder. It is pretty self-explanatory and should be enough to get you started. You can also try out a live demo at this address http://cote.cc/projects/cssliveupdate

## Setup

To use CssLiveUpdate, first load jQuery and then load the CssLiveUpdate plugin. Typically these two lines would be placed right before `</body>` :

```html
<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
<script src="jquery.cssliveupdate.js"></script>
```

Then, flag all elements whose content should continually update the page styles with the `data-cssliveupdate` attribute. For example: 

```html
<textarea data-cssliveupdate>a {color: red}</textarea> 
```

or

```html
<div data-cssliveupdate content-editable>a {color: blue}</div>
```

You can watch as many elements as you like. Their contents will all be merged in the `<style class="cssliveupdate">` tag in the `<head>` of the page.
 
At init, all elements with the `data-cssliveupdate` attribute are parsed and their content is automatically added to the `<style>` tag.

That's it. Pretty easy, huh?

If you prefer to do it manually, do not use the `data-cssliveupdate` attribute and instead call CssLiveUpdate with the `activate` or `deactivate` keyword yourself:

```javascript
$("#source-element").CssLiveUpdate("activate");
$("#source-element").CssLiveUpdate("deactivate");
```

## Browser support

CssLiveUpdate has been tested and is known to work on : 

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

This will automatically highlight all code on the page that is included in a  `<pre><code>...</code></pre>` block. To be safe, add the `css` class to the `code` tag so it knows which syntax coloring to use:

```css
<pre><code class="css">
a { 
  color: red; 
}
</code></pre>
```

## Reporting an Issue

1. Before reporting, make sure you have the latest version of CssLiveUpdate and a supported version of jQuery.
2. Make sure your JavaScript code is free of bugs. You can use a tool such as [JSHint](http://www.jshint.com/) to do so.
2. Make sure the problem you are reporting is reproducible. Use [JSBin](http://jsbin.com) to provide an example page.
3. Indicate what browser(s) and platform(s) the issue can be reproduced in. **Note: issues that arise in Internet Explorer while in "compatibility mode" will not be addressed.**

## License

I'll get back to you on this...
