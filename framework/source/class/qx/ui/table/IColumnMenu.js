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
 * Interface for creating the column visibility menu
 */
qx.Interface.define("qx.ui.table.IColumnMenu",
{
  properties :
  {
    menu : { }
  },

  members :
  {
    /**
     * Instantiate a sub-widget.
     *
     * @param item {String}
     *   One of the following strings, indicating what type of
     *   column-menu-specific object to instantiate:
     *   <dl>
     *     <dt>menu</dt>
     *     <dd>
     *       Instantiate a menu which will appear when the column visibility
     *       button is pressed. No options are provided in this case. 
     *     </dd>
     *     <dt>menu-button</dt>
     *     <dd>
     *       Instantiate a button to correspond to a column within the
     *       table. The options are a map containing <i>text</i>, the name of
     *       the column; <i>column</i>, the column number; and
     *       <i>bVisible</i>, a boolean indicating whether this column is
     *       currently visible. The instantiated return object must implement
     *       interface {@link qx.ui.table.IColumnMenuCheckbox}
     *     </dd>
     *     <dt>user-button</dt>
     *     <dd>
     *       Instantiate a button for other than a column name. This is used,
     *       for example, to add the "Reset column widths" button when the
     *       Resize column model is requested. The options is a map containing
     *       <i>text</i>, the text to present in the button.
     *     </dd>
     *     <dt>separator</dt>
     *     <dd>
     *       Instantiate a separator object to added to the menu. This is
     *       used, for example, to separate the table column name list from
     *       the "Reset column widths" button when the Resize column model is
     *       requested. No options are provided in this case.
     *     </dd>
     *   </dl>
     *
     * @param options {Map}
     *   Options specific to the item being requested. See #item.
     *
     * @return {qx.ui.core.Widget}
     *   The instantiated object as specified by #item.
     */
    factory : function(item, text)
    {
      return true;
    },
    
    /**
     * Empty the menu of all items, in preparation for building a new column
     * visibility menu.
     *
     * @return {Void}
     */
    empty : function()
    {
      return true;
    }
  }
});
