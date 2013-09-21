/*!
 * CssLiveUpdate jQuery plugin v0.6a
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
 * @todo react on cut (paste seems to work)
 * 
 */
(function ($) {

    "use strict";

    // Plugin name (used, notably, for event namespacing)
    var pluginName = 'CssLiveUpdate';

    // Default options
    var defaultOptions = {
        applySourceRulesAtInit: true
    };

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
     *  <code data-cssliveupdate-target="#demo" contenteditable>a {color: red;}</code>
     *
     * In the above example, the element with id 'demo' will have its 'style' attribute
     * updated whenever the source's content changes.
     *
     * Please note that if a target is passed to the function, it will override any
     * 'data-cssliveupdate-target' present.
     *
     * @param {string} action    - The object to retrieve the CSS rules from.
     * @param {string} [target]  - The optional jQuery selector string to use to find the 
     *                             element to update.
     * @param {Object} [options] - Object containing the options for the plugin.
     */
    $.fn.cssLiveUpdate = function (action, target, options) {

        options = $.extend({}, defaultOptions, options || {});

        /**
         * Returns a string of CSS rules found in the parameter after having performed some
         * necessary cleanup operations such as: removing the selector and curly braces, 
         * removing newlines and returns, removing comments, etc.
         *
         * @param {string} content - The string to extract the CSS rules from
         * @returns {string} - CSS rules on one line
         */
        function getCleanRules(content) {

            // Strip newlines, returns and tabs. Remove CSS comments.
            content = content.replace(/(\r\n|\n|\r|\t)/gm, " ");
            content = content.replace(/\/\*.*?\*\//gm, "");
            
            // Match rulesets (for whatever reason, the curly braces are included in the 
            // results ?!)
            var rulesets = content.match(/\{(.)*?\}/gi);

            // Check if rules were enclosed in curly braces
            var rules = '';
            if (rulesets) {
       
                // Concatenate the rulesets in a long one-liner by removing the curly braces 
                // and semi-colons and trimming the result.
                for (var i = 0; i < rulesets.length; i++) {
                    rulesets[i] = rulesets[i].replace(/(\{|\}|;)/gm, "");
                    rulesets[i] = $.trim(rulesets[i]);
                } 

                rules = rulesets.join('; ');

            } else {
                rules = $.trim(content);
                rules = rules.replace(/\s{2,}/gm, " "); 
            }
            
            return rules;
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

        /**
         * Watches the source jQuery object's content for changes and updates the target 
         * jQuery object's 'style' attribute accordingly. The source can be a form element 
         * (textarea, input or select) or a regular element (typically with the 
         * 'contenteditable' attribute set to true).
         *
         * @param {jQuery} source - The object to retrieve the CSS rules from.
         * @param {jQuery} target - The object upon which to perform an update of the 
         *                          'style' attribute.
         */
        function activate(source, target) {

            // Make sure only a single listener is registered with that object
            deactivate(source);

            // Apply the rules found in the source to the target (if configured)
            if (options.applySourceRulesAtInit) {
                applyRules(source, target);
            }
            
            source.on('keyup.' + pluginName, function(event) {
                applyRules(source, target);

                
            });
            
            //Convert tabs to 2-space and prevent them from triggering a blur event
            source.on('keydown.' + pluginName, function(event) {
            
                if (event.which === 9) {
                    event.preventDefault();
                    //insertTextAtCursor("  ");
                }

                // Check if a cut/copy/paste operation is ongoing. If it's the case, save
                // the current content for comparison on keyup
                if(event.ctrlKey || event.metaKey) {
                    // var content = source.text();
                    // source.on('keyup.' + pluginName, function() {
                    //     alert(content + '      ' + source.text())
                    //     if (content != source.text()) {
                    //         alert('ok')
                    //         applyRules(source, target);
                    //     }
                    // })
                }
                
            });
            
        }

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

        /**
         * Insert the rules found in the source to the "style" attribute of the target(s).
         *
         * @param {jQuery} target - The object(s) upon which to perform an update of the 
         *                          'style' attribute.
         * @param {jQuery} rules - A string representation of the CSS rules.
         */
        function applyRules(source, target) {

            var rules = '';
                
            if ( source.is('input, textarea, select') ) {
                rules = getCleanRules(source.val());
            } else if ( source.text().length > 0 ) {
                rules = getCleanRules(source.text());
            }

            if (rules) {
                target.each(function() {
                    $(this).attr('style', rules);
                });
            }

        }
        
        // Fetch target selector from 'data-cssliveupdate-target' unless a target is 
        // specified in the second parameter.
        target = target || this.data('cssliveupdate-target');

        if (action === 'activate') {
            activate(this.first(), $(target)); // only use first found element
        } else if (action === 'deactivate') {        
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