/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * HTML templating module. This is a wrapper for mustache.js which is a 
 * "framework-agnostic way to render logic-free views".
 *
 * Here is a basic example how to use it:
 * <pre class="javascript">
 * var template = "Hi, my name is {{name}}!";
 * var view = {name: "qooxdoo"};
 * q.template.toHtml(template, view);
 * // return "Hi, my name is qooxdoo!"
 * </pre>
 *
 * For further details, please visit the mustache.js documentation here:
 *   https://github.com/janl/mustache.js/blob/master/README.md
 */
qx.Bootstrap.define("qx.module.Template", {
  statics :
  {
    /**
     * Helper method which provides you with a direct access to templates 
     * stored as HTML in the DOM. The DOM node with the given ID will be treated
     * as a template, parsed and a new DOM node will be returned containing the
     * parsed data. Keep in mind to have only one root DOM element in the template.
     * 
     * @param id {String} The id of the HTML template in the DOM.
     * @param view {Object} The object holding the data to render.
     * @param partials {Object} Object holding parts of a template.
     * @return {qx.Collection} Collection containing a single DOM element with the parsed 
     * template data.
     */
    get : function(id, view, partials) {
      var el = qx.bom.Template.get(id, view, partials);
      return qx.lang.Array.cast([el], qx.Collection);
    },

    /**
     * Original and only template method of mustache.js. For further
     * documentation, please visit https://github.com/janl/mustache.js
     *
     * @param template {String} The String containing the template.
     * @param view {Object} The object holding the data to render.
     * @param partials {Object} Object holding parts of a template.
     * @param send_fun {Function?} Callback function for streaming.
     * @return {String} The parsed template.
     */
    toHtml : function(template, view, partials, send_fun) {
      return qx.bom.Template.toHtml(template, view, partials, send_fun);
    }
  },


  defer : function(statics) {
    q.attachStatic({
      "template" : {get: statics.get, toHtml: statics.toHtml}
    });
  }
});
