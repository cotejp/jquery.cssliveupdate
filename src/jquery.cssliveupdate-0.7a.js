/*!
 * CssLiveUpdate jQuery plugin v0.7a
 * 
 * (c) 2013, Jean-Philippe Côté - http://cote.cc/projects/cssliveupdate
 *
 * CssLiveUpdate updates the page's CSS styles with the content of the HTML
 * element(s) its watching. This makes it very easy to create a CSS demo page 
 * where any CSS typed into a form field is added in a <style> tag in the <head>
 * of the page. It is meant to be used for CSS demos, conferences, etc.
 *
 * The elements being watched are typically form elements (textarea or input) or 
 * a regular element bearing the "contenteditable" attribute.
 * 
 * To use it, first load jQuery and then load the CssLiveUpdate plugin. 
 * Typically these two lines would be placed right before </body> :
 *
 *   <script src="jquery.min.js"></script>
 *   <script src="jquery.cssliveupdate-0.7a.js"></script>
 *
 * Then, flag all elements whose content should continually update the page 
 * styles with the "data-cssliveupdate" attribute. For example: 
 *
 *   <textarea data-cssliveupdate>a {color: red}</textarea> 
 *   
 *   or
 *   
 *   <div data-cssliveupdate content-editable>a {color: blue}</div>
 *
 * You can watch as many elements as you like. Their contents will all be merged 
 * in a <style> tag in the <head> of the page.
 *
 * At init, all elements with the "data-cssliveupdate" attribute are parsed and 
 * their content is automatically added to the <style> tag.
 * 
 * If you prefer to do it manually, do not use the "data-cssliveupdate"
 * attribute and instead call CssLiveUpdate with the "activate" or "deactivate" 
 * keyword yourself:
 *
 *   $("#source-element").CssLiveUpdate("activate");
 *   $("#source-element").CssLiveUpdate("deactivate");
 * 
 * CssLiveUpdate has been tested and is known to work on : Safari 6 (Mac), 
 * Firefox 23 (Mac), Chrome 29 (Mac, Win), Internet Explorer 10 (Win). Let me 
 * know if you test it on other platforms so I can update this list.
 *
 * CssLiveUpdate requires jQuery v1.7.2 and above (including the 2.x branch). We
 * recommend you use highlight.js for syntax coloring (optional).
 *
 * @todo Find a better replacement to the 'input' event for IE that does not 
 *       support it (currently, keyup is used which adds an unnecessary 
 *       overhead)
 */
(function ($, undefined) {

    "use strict";

    var pluginName      =   'CssLiveUpdate',

        lcPluginName    =   pluginName.toLowerCase(),

        defaultOptions  =   {
            applyUponActivation: true,
            defaultTabBehaviour: false,
            replaceTabWith:      "\t"
        },

        suspicious      =   [
            // Comment immediately following a letter
            /(\w\/\/|\w\/\/*\*)/,

            // Slash followed by asterisk followed by slash 
            /(\/\*\/)/,

            // Backslash             
            /\\/,

            // JavaScript expressions              
            /(\bdata:\b|eval|cookie|\bwindow\b|\bparent\b|\bthis\b)/i,

            // CSS expressions
            /moz-binding|@import|@charset/i,

            // Other potentially dangerous stuff
            /behaviou?r|expression|(java|vb)?script|[\<]|\\\w/i,

            // Low bytes
            /[\x00-\x08\x0B\x0C\x0E-\x1F]/,

            // bad charset 
            /&\#/
        ];

    /**
     * Activates or deactivates the live CSS updating for the elements found by
     * the regular jQuery selector. When an element is activated, its textual 
     * content is considered to be CSS and is added to the 
     * <style class="cssliveupdate"> tag of the page (in the <head>). Whenever 
     * the element's content is changed, the changes are reflected in the 
     * <style> tag.
     *
     * The first argument is the action to perform (as a string): "activate" 
     * (default) or "deactivate".
     *
     * The second argument is an object containing plugin options. The options 
     * are:
     *
     *  - applyUponActivation (boolean): whether to apply the rules right upon 
     *    activation (default) or later when the content is actually being 
     *    changed.
     *
     *  - defaultTabBehaviour (boolean): whether pressing TAB while editing will
     *    take the user to the next field or will be entered in the field being
     *    edited (default).
     *
     *  - replaceTabWith (string): the string to replace tabs with. Default is 
     *    "\t".
     *
     * Example syntax:
     *
     *    $('#some-element').CssLiveUpdate('activate', {
     *        applyUponActivation: false,
     *        defaultTabBehaviour: true,
     *        replaceTabWith: "    "
     *    });
     *
     * @param {string} [action]  - The action to perform as a string: "activate" 
     *                             (default) or "deactivate".
     * @param {Object} [options] - Options for the plugin (as an Object).
     */
    $.fn.CssLiveUpdate = function (action, options) {

        options = $.extend({}, defaultOptions, options || {});

        /**
         * Returns a cleaned up version of the CSS styles passed in as a 
         * parameter. CSS and HTML comments are removed and the string is tested
         * for know vulnerabilities. If a vulnerability is detected, the 
         * function simply returns the following css-commented string: 
         * "Suspicious activity detected".
         *
         * @param {string} content  - The CSS string.
         * @returns {string}        - Cleaned up version of the CSS string.
         */
        function cleanStyles(content) {

            // Remove CSS and HTML comments
            content = content.replace(/\/\*.*?\*\//gm, "");
            content = content.replace(/<!--.*?->/gm, "");

            // Stop processing if suspicious activity is detected
            for (var i = suspicious.length - 1; i >= 0; i--) {
                if ( content.match(suspicious[i]) ) {
                    return '/* Suspicious activity detected */';
                }
            }

            return content;

        }

        /**
         * Deregisters all listeners from the CssLiveUpdate namespace for all 
         * the objects in the collection received as a parameter. This prevents 
         * any further updating from objects in the collection.
         * 
         * @param {jQuery} source - The jQuery collection of objects to stop 
         *                          monitoring.
         */
        function deactivate(source) {
            source.off('.' + pluginName);
        }

       /**
        * Returns the textual content found in the source collection's first 
        * element. Returns an empty string if no content is found.
        * 
        * @param  {jQuery} source - The jQuery collection we want to fetch the 
        *                           text from (first found element only).
        * @return {string}        - The string as found in the source or an 
        *                           empty string if nothing is found.
        */
       function getContent(source) {

            // Err on the safe side (in case the source matches multiple 
            // elements)
            source = source.first();

            if ( source.is('input, textarea') ) {
                return source.val();
            } else if ( source.text().length > 0 ) {
                return source.text();
            } else {
                return '';
            }

       }

        /**
         * Updates the <style class="cssliveupdate"> element in the <head> of 
         * the page with what is found in the source collection of elements.
         *
         * @param {jQuery} source - The jQuery collection to fetch the CSS rules 
         *                          from.
         */
        function updateStyleElement(source) {

            var css = '',
                styleTag;

            // Concatenate the CSS rules from all tags in the jQuery collection
            source.each(function() {
                css += getContent($(this));
            });

            styleTag = "<style class='" + lcPluginName + "'>\n" + 
                       cleanStyles(css) + 
                       "\n</style>";

            // Append to or replace the <style> head tag
            if ( $('head style.' + lcPluginName).length > 0) {
                $('head style.' + lcPluginName).replaceWith(styleTag);
            } else {
                $(styleTag).appendTo( "head" );
            } 

        }

        /**
         * Activates monitoring and updating on the inherited jQuery collection. 
         * The source is a jQuery collection of one or more elements. They can 
         * be form elements (textarea or input) or any regular elements 
         * (typically with the 'contenteditable' attribute set to true).
         *
         * @param {jQuery} source - The jQuery collection to retrieve the CSS 
         *                          rules from.
         */
        function activate(source) {

            // Make sure we are not registering multiple listeners for the same
            // source
            deactivate(source);

            // Apply the rules found in the source collection (unless bypassed)
            if (options.applyUponActivation) { updateStyleElement(source); }

            // Monitor input. When it changes, update the styles. The 'keyup'
            // eent has been added to fix the non-existent support for 'input' 
            // in IE.
            source.on('input.' + pluginName + ' keyup.' + pluginName, function() {
                updateStyleElement(source); 
            });

            // Prevent TABs from blurring the field while editing unless 
            // specified otherwise through the 'defaultTabBehaviour' option.
            if (!options.defaultTabBehaviour) {

                source.on('keydown.' + pluginName, function(event) {

                    if (event.which === 9) {
                        event.preventDefault();
                        replaceSelectionWithText(options.replaceTabWith);
                        updateStyleElement(source); 
                    }

                });

            }
            
        }

        /**
         * Replaces the current selection with the specified text. The selection
         * can be in a regular form field (textarea or input) or in a
         * content-editable element.
         * 
         * @param  {string} [text] The string to replace the selection with 
         *                         (defaults to the empty string).
         */
        function replaceSelectionWithText(text) {

            text = text || '';

            // WebKit & Gecko treat form field selection and DOM Range selection
            // in a vastly different way...
            if ( $(':focus').is('textarea, input') ) {
                replaceFormElementSelectionWithText(text);
            } else {
                replaceDomSelectionWithText(text);
            }

        }


        /**
         * Replaces the current selection in a contenteditable-enabled element 
         * with the specified text.
         * 
         * @param  {string} text The replacement text
         */
        function replaceDomSelectionWithText(text) {

            var sel, range;

            if (window.getSelection) { // Non-IE Browsers

                // Fetch the Selection object
                sel = window.getSelection();

                // Check that we can use getRangeAt() et rangeCount)
                if (sel.getRangeAt && sel.rangeCount) {

                    // Grab the first Range object available
                    range = sel.getRangeAt(0);
                    range.deleteContents();

                    // Insert the new text node
                    var node = document.createTextNode(text);
                    range.insertNode(node);

                    // Those 3 lines simply move the cursor after the inserted
                    // text. Could this be any more convoluted? This is 
                    // bullshit!
                    range.setStartAfter(node);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }

            } else if (document.selection && document.selection.createRange) { // IE
                document.selection.createRange().text = text;
            }
    
        }
        
        /**
         * Replaces the current selection in a form element with the specified
         * text.
         * 
         * @param  {string} text The replacement text
         */
        function replaceFormElementSelectionWithText(text) {

            if (document.selection) {           // IE
              document.selection.createRange().text = text;
            } else if (window.getSelection) {   // Gecko + WebKit
                var that = $(':focus')[0];
                var startPos = that.selectionStart;
                var endPos = that.selectionEnd;
                var scrollTop = that.scrollTop;
                that.value = that.value.substring(0, startPos) + 
                    text + 
                    that.value.substring(endPos, that.value.length);
                that.selectionStart = startPos + text.length;
                that.selectionEnd = startPos + text.length;
                that.scrollTop = scrollTop;
            } else {
              $(':focus')[0].value += text;
            }

        };

        // Initial code being run for the CssLiveUpdate object function (support
        // traditional jQuery chaining).
        if (action === 'deactivate') {
            deactivate(this);
        } else {        
            activate(this);
        }
        return this;
    
    };
    
    /**
     * Automatically starts the plugin at init by finding all HTML elements 
     * bearing the 'data-cssliveupdate' attribute and starting to watch if they 
     * change.
     */
    $(function() {
        $('[data-' + lcPluginName + ']')[pluginName]();
    });
    
}( jQuery ));
