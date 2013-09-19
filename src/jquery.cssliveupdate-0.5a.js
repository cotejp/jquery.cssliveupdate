/*!
 * CssLiveUpdate jQuery plugin v0.5.1a
 *
 * Continually updates a target element's "style" attribute with the content from a watched
 * source element. Typically, the source element is either a form field (textarea, input or
 * select) or a regular element with the "contenteditable" attribute set.
 * 
 * To use it, first load jQuery and the CssLiveUpdate plugin:
 *
 *   <script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
 *   <script src="js/jquery.cssliveupdate.js"></script>
 *
 * Then, simply assign a jQuery selector to the "data-cssliveupdate-target" attribute of the
 * element containing the CSS rules that will be modified. This selector should point to the
 * element that will have its "style" attribute updated:
 *
 *   <textarea data-cssliveupdate-target="#demo">a {color: red;}</textarea>
 *   <div id="demo">This div will have it's "style" attribute modified!</div>
 *
 * All fields with "data-cssliveupdate-target" defined are automatically updated. If you
 * prefer, you can alternatively manually activate or deactivate the live update:
 *
 *   $("#some-source-element").cssLiveUpdate("activate", "some-target-element");
 *   $("#some-source-element").cssLiveUpdate("deactivate");
 * 
 * Tested and known to work on : Safari 6 (Mac), Firefox 23 (Mac), Chrome 29 (Mac, Win), 
 * Internet Explorer 10 (Win). Let me know if you test it on other platforms.
 *
 * (c) 2013, Jean-Philippe Côté - http://cote.cc/projects/cssliveupdate
 *
 * @todo Insert TAB (or spaces) at cursor position when the TAB key is pressed. 
 */
(function ($) {

    // Plugin name used, notably, for event namespacing (it's outside the plugin function
    // because it should only be instantiated once).
    var pluginName = 'CssLiveUpdate';

    /**
	 * Activates or deactivates the live css updating for the specified source and target
	 * elements. The source is inherited from the regular jQuery selector. 
	 *
	 * Activation can only be performed on a single source element. Therefore, the jQuery 
	 * selector should return a single element. If it returns more than one element, the 
	 * activation will only be attempted on the first element found (as ordered by their 
	 * appearance in the DOM).
	 * 
	 * Deactivation can be performed on one or many elements.
	 *
	 * The target object(s) whose 'style' attribute should be updated can be defined by 
	 * passing a selector string as the second parameter. However, the prefered method is
	 * to define a 'data-cssliveupdate-target' attribute on the source element. The value
	 * of this attribute is the jQuery selector string to use to find the target element:
	 *
	 *	<code data-cssliveupdate-target="#demo" contenteditable>a {color: red;}</code>
	 *
	 * In the above example, the element with id 'demo' will have its 'style' attribute
	 * updated whenever the source's content changes.
	 *
	 * Please note that if a target is passed to the function, it will override any
	 * 'data-cssliveupdate-target' present.
	 *
	 * @param {string} action - The object to retrieve the CSS rules from
	 * @param {string} [target] - The optional jQuery selector string to use to find the 
	 * 							  element to update.
	 */
	$.fn.cssLiveUpdate = function (action, target) {
		
		/**
		 * Watches the source jQuery object's content for changes and updates the target 
		 * jQuery object's 'style' attribute accordingly. The source can be a form element 
		 * (textarea, input or select) or a regular element (typically with the 
		 * 'contenteditable' attribute set to true).
		 *
		 * @param {jQuery} source - The object to retrieve the CSS rules from.
		 * @param {jQuery} target - The object upon which to perform an update of the 
		 * 							'style' attribute.
		 */
		function activate(source, target) {
			
			// Make sure only a single listener is registered with that object
			deactivate(source);
			
			source.on('keyup.' + pluginName, function() {
				
				var rules = '';
				
				if ( source.is('input, textarea, select') ) {
					rules = getCleanRules(source.val());
				} else if ( $(this).text().length > 0 ) {
					rules = getCleanRules(source.text());
				}
				
				if (rules) {
					target.each(function() {
						$(this).attr('style', rules);
					});
				}
				
			});
			
			//Convert tabs to 2-space and prevent them from triggering a blur event
			source.on('keydown.' + pluginName, function(event) {
			
				if (event.which == 9) {
					event.preventDefault();
					//insertTextAtCursor("  ");
				}
				
			});
			
			/*
			function insertTextAtCursor(text) {
				var sel, range, html;
				if (window.getSelection) { //non IE Browsers
					sel = window.getSelection();
					if (sel.getRangeAt && sel.rangeCount) {
						range = sel.getRangeAt(0);
						range.deleteContents();
						range.insertNode( document.createTextNode(text) );
					}
				} else if (document.selection && document.selection.createRange) {//IE
					document.selection.createRange().text = text;
				}
				
				//moveCaret(window, 20);
		
			}
			*/
			
		}
		
		/**
		 * Returns a string of CSS rules found in the parameter after having removed the 
		 * selector and curly braces and after having merged them on one line.
		 *
		 * @param {string} content - The string to extract the CSS rules from
		 * @returns {string} - CSS rules on one line
		 */
		function getCleanRules(content) {
			// A regex to match everything between the CSS's curly braces even if it spans 
			// multiple lines. The .* does not match newlines. That's why we use [\s\S]. 
			// This matches any whitespace or non-whitespace (meaning all characters). The 
			// /s modifier does not exist in JS...
			var rules = content.match(/{([\s\S]*)}/i)[1];
			
			// Strip newlines and returns
			return rules.replace(/(\r\n|\n|\r)/gm, " ");
		}
		
		/**
		 * Stops watching the source jQuery object for changes and, therefore, also stops
		 * the target updating process
		 * 
		 * @param {jQuery} source - The object to watching
		 */
		function deactivate(source) {
			source.each(function() {
				$(this).off('keyup.' + pluginName + ' keydown.' + pluginName);
			});
		}
		
		// Fetch target selector from 'data-cssliveupdate-target' unless a target is 
		// specified in the second parameter.
		target = target || this.data('cssliveupdate-target');

		if (action == 'activate') {
			activate(this.first(), $(target)); // only use first found element
		} else if (action == 'deactivate') {		
			deactivate(this);
		}
		
		// Support chaining
		return this;
	
	};
	
	/**
	 * Automatically activates the plugin by finding all HTML elements possessing the
	 * 'data-cssliveupdate-target' attribute. The value of the attribute is used as a
	 * jQuery selector to find the target(s) that should be updated.
	 */
	$(function() {
		
		$('[data-cssliveupdate-target]').each(function() {	
			jQuery(this).cssLiveUpdate('activate');
		});

	});
	
}( jQuery ));