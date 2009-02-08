/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Interface for a checkbox menu item.
 */
qx.Interface.define("qx.ui.table.IColumnMenuCheckbox",
{
  properties :
  {
    /**
     * Whether the table column associated with this menu item is visible
     */
    visible : { }
  },

  events :
  {
    /*
     * Dispatched when a column changes visibility state. The event data is a
     * boolean indicating whether the table column associated with menu item
     * is now visible.
     */
    changeVisible : "qx.event.type.Data"
  }
});
