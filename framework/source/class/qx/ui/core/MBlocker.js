/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This mixin blocks events and can be included into all widgets.
 *
 * The {@link #block} and {@link #unblock} methods provided by this mixin can be used
 * to block any event from the widget. When blocked,
 * the blocker widget overlays the widget to block, including the padding area.
 *
 * The second set of methods ({@link #blockContent}, {@link #unblockContent})
 * can be used to block child widgets with a zIndex below a certain value.
 */
qx.Mixin.define("qx.ui.core.MBlocker",
{
  construct: function() {
    this.__blocker = new qx.ui.core.Blocker(this);
  },
  
  
  properties :
  {
    /**
     * Color of the blocker
     */
    blockerColor  :
    {
      check : "Color",
      init : null,
      nullable: true,
      apply : "_applyBlockerColor",
      themeable: true
    },


    /**
     * Opacity of the blocker
     */
    blockerOpacity :
    {
      check : "Number",
      init : 1,
      apply : "_applyBlockerOpacity",
      themeable: true
    }
  },

  
  members :
  {
    __blocker : null,

    // property apply
    _applyBlockerColor : function(value, old) {
      this.__blocker.setColor(value);
    },


    // property apply
    _applyBlockerOpacity : function(value, old)
    {
      this.__blocker.setOpacity(value);
    },
    
    /**
     * Block all events from this widget by placing a transparent overlay widget,
     * which receives all events, exactly over the widget.
     */
    block : function()
    {
      this.__blocker.block();
    },


    /**
     * Returns whether the widget is blocked.
     *
     * @return {Boolean} Whether the widget is blocked.
     */
    isBlocked : function() {
      return this.__blocker.isBlocked();
    },


    /**
     * Unblock the widget blocked by {@link #block}
     */
    unblock : function()
    {
      this.__blocker.unblock();
    },


    /**
     * Block direct child widgets with a zIndex below <code>zIndex</code>
     *
     * @param zIndex {zIndex} All child widgets with a zIndex below this value
     *     will be blocked
     */
    blockContent : function(zIndex)
    {
      this.__blocker.blockContent(zIndex);
    },


    /**
     * Whether the content is blocked
     *
     * @return {Boolean} Whether the content is blocked
     */
    isContentBlocked : function() {
      return this.__blocker.isContentBlocked();
    },


    /**
     * Remove the content blocker.
     */
    unblockContent : function()
    {
      this.__blocker.unblockContent();
    }
  },


  destruct : function() {
    this._disposeObjects("__blocker");
  }
});