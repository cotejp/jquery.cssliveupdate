/*!
 * CssLiveUpdate jQuery plugin v0.6.1a
 *
 * Continually updates a target element's "style" attribute with the textual CSS
 * content from a watched source element. Typically, the source element is a 
 * form field (textarea, input or select) or a regular element with the 
 * "contenteditable" attribute set (although this is not mandatory).
 * 
 * To use it, first load jQuery and then the CssLiveUpdate plugin:
 *
 *   <script src="js/jquery.min.js"></script>
 *   <script src="js/jquery.cssliveupdate.js"></script>
 *
 * Then, identify the element(s) containing the CSS rules you want to apply 
 * elsewhere. On those elements, add a "data-cssliveupdate-target" attribute. 
 * This attribute should contain a jQuery selector string to target the element 
 * whose "style" attribute will be updated:
 *
 *   <textarea data-cssliveupdate-target="#demo">a {color: red;}</textarea>
 *   <div id="demo">This div will have it's "style" attribute modified!</div>
 *
 * In this case, the #demo element's style attribute will be assigned the 
 * content of the textarea (after some CSS clean up is performed).
 *
 * At init, all elements with the "data-cssliveupdate-target" attribute are 
 * automatically parsed and their target updated. 
 * 
 * If you prefer to do it manually, do not use the "data-cssliveupdate-target"
 * attribute and instead call the activate() or deactivate() methods yourself:
 *
 *   $("#source-element").cssLiveUpdate("activate", "#target-element");
 *   $("#source-element").cssLiveUpdate("deactivate");
 * 
 * CssLiveUpdate has been Tested and is known to work on : Safari 6 (Mac), 
 * Firefox 23 (Mac), Chrome 29 (Mac, Win), Internet Explorer 10 (Win). Let me 
 * know if you test it on other platforms so I can update this list.
 *
 * (c) 2013, Jean-Philippe Côté - http://cote.cc/projects/cssliveupdate
 *
 * @todo make it so activate() can be called more than once for the same source
 * with different targets.
 * 
 * @todo make applyRules() available from the outside so a program can modify the
 * source content and then apply it to the target. OR SHOULD WE SIMPLY WATCH THE
 * CONTENT FOR MODIFICATIONS ?
 *
 * @todo inset spaces at cursor position when tab is pressed.
 */
(function ($) {

    "use strict";

    // Plugin name (used, notably, for event namespacing)
    var pluginName      =   'CssLiveUpdate',
        defaultOptions  =   {
                                applyNow: true
                            };

    /**
     * Activates or deactivates the live css updating for the specified source 
     * and target elements. The source is inherited from the regular jQuery 
     * selector. 
     *
     * Currently, activation can only be performed on a single source element. 
     * Therefore, the jQuery selector should return a single element. If it 
     * returns more than one element, the activation will only be attempted on 
     * the first element found by the selector (as ordered by their appearance 
     * in the DOM).
     * 
     * Deactivation can be performed on one or many elements.
     *
     * The target object(s) whose 'style' attribute should be updated is usully 
     * fetched from the 'data-cssliveupdate-target' attribute of the source 
     * element. The value of this attribute is the jQuery selector string to use 
     * to find the target element:
     *
     *  <p data-cssliveupdate-target="#demo" contenteditable>a {color: red}</p>
     *
     * In the above example, the element with id 'demo' will have its 'style' 
     * attribute updated whenever the source's content changes.
     *
     * Alternatively, you can pass the jQuery selector string as the second 
     * argument in which case it overrides any 'data-cssliveupdate-target' 
     * value.
     *
     * The  third argument is an object defining plugin options. So far, the 
     * only option available is the boolean "applyNow". If set to true (default)
     * it immediately applies the source's content to the target's style. 
     * Otherwise, the update will be performed only when the content actually 
     * changes.
     *
     * @param {string} [action]  - The action to perform as a string: "activate" 
     *                             (default) or "deactivate".
     * @param {string} [target]  - The optional jQuery selector string to use to 
     *                             find the element(s) to update.
     * @param {Object} [options] - Object containing the options for the plugin.
     */
    $.fn.cssLiveUpdate = function (action, target, options) {

        options = $.extend({}, defaultOptions, options || {});

        /**
         * Returns a string of CSS rules found in the string parameter after
         * having performed some necessary cleanup operations such as: removing 
         * the selector(s) and curly braces, removing newlines and returns, 
         * removing comments, trimming, etc.
         *
         * @param {string} content  - The string to extract the CSS rules from.
         * @returns {string}        - One-line string containing all the found 
         *                            CSS rules.
         */
        function getCleanRules(content) {

            var rules       = '',
                rulesets;

            // Strip newlines, returns and tabs. Remove CSS comments.
            content = content.replace(/(\r\n|\n|\r|\t)/gm, " ");
            content = content.replace(/\/\*.*?\*\//gm, "");
            
            // Match rulesets (for whatever unknown reason, the curly braces are 
            // included in the results ?!) AM I MAKING A MISTAKE HERE ?!
            rulesets = content.match(/\{(.)*?\}/gi);

            // Check if the content includes selector(s) and curly braces (they
            // don't have to but they can).
            // var rules = '';
            if (rulesets) {
       
                // Concatenate the rulesets in a long one-liner by removing the 
                // curly braces and semi-colons and trimming the result.
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
         * Deregisters the listener on the source object(s). This prevents any 
         * further updating of the target(s).
         * 
         * @param {jQuery} source - The jQuery collection to stop watching.
         */
        function deactivate(source) {
            source.each(function() {
                $(this).off('keydown.' + pluginName);
            });
        }

        /**
         * Watches the first element of the source jQuery collection for changes
         * and updates the target(s) 'style' attribute accordingly. The source 
         * can be a form element (textarea, input or select) or any regular 
         * element (typically with the 'contenteditable' attribute set to true).
         *
         * @param {jQuery} source - The jQuery collection to retrieve the CSS 
         *                          rules from (first element is used).
         * @param {jQuery} target - The jQuery collection of objects upon which 
         *                          to perform an update of the 'style' 
         *                          attribute.
         */
        function activate(source, target) {

            // Make sure only a single listener is registered with that object
            deactivate(source);

            // Apply the rules found in the source to the target (if required)
            if (options.applyNow) {
                applyRules(source, target);
            }
            
            // We first listen to "keydown" and then "keyup" so we can compare 
            // the content before and after to make sure it actually changed. 
            // This also allows us to track cut, copy and paste operations.
            source.first().on('keydown.' + pluginName, function(event) {

                var original = getContent(source);

                // We do it this way to only update when content has changed
                $(this).on('keyup.' + pluginName, function() {

                    if (original !== getContent($(this))) {
                        applyRules($(this), target);  
                    } 
                    $(this).off('keyup.' + pluginName);

                });
            
                if (event.which === 9) {
                    event.preventDefault();
                    //insertTextAtCursor("  ");
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
        * Returns the textual content found in the source. Returns an empty 
        * string if no content is found.
        * 
        * @param  {jQuery} source - The jQuery collection we want to fetch the 
        *                           text from (first found element only).
        * @return {string}        - The string as found in the source or an 
        *                           empty string if nothing is found.
        */
       function getContent(source) {

            source = source.first();

            if ( source.is('input, textarea, select') ) {
                return source.val();
            } else if ( source.text().length > 0 ) {
                return source.text();
            } else {
                return '';
            }

       }

        /**
         * Insert the rules found in the source object to the "style" attribute 
         * of the target(s) (even if empty).
         *
         * @param {jQuery} source - The jQuery collection to fetch the CSS rules 
         *                          from (first element only).
         * @param {jQuery} target - The jQuery collection upon which to perform 
         *                          an update of the 'style' attribute.
         */
        function applyRules(source, target) {

            var rules = getCleanRules(getContent(source));

            target.each(function() {
                $(this).attr('style', rules);
            });

        }
        
        // Fetch target selector from 'data-cssliveupdate-target' unless a 
        // target is specified in the second parameter.
        target = target || this.data('cssliveupdate-target');

        if (action === 'deactivate') {
            deactivate(this);
        } else {        
            activate(this.first(), $(target)); // only use first found element
        }
        
        // Support chaining
        return this;
    
    };
    
    /**
     * Automatically activates the plugin by finding all HTML elements 
     * possessing the 'data-cssliveupdate-target' attribute. The value of the 
     * attribute is used as a jQuery selector to find the target(s) that should 
     * be updated.
     */
    $(function() {
        
        $('[data-cssliveupdate-target]').each(function() {  
            $(this).cssLiveUpdate('activate');
        });

    });
    
}( jQuery ));