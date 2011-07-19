/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Application header widget.
 */
qx.Class.define("playground.view.Header",
{
  extend : qx.ui.container.Composite,

  construct : function()
  {
    this.base(arguments, new qx.ui.layout.HBox());
    this.setAppearance("app-header");

    var versionTag = this.tr("qooxdoo %1", qx.core.Environment.get("qx.version"));
    var riaButton = new qx.ui.form.RadioButton(this.tr("Desktop"));
    riaButton.set({
      model: "ria",
      appearance: "modeButton"
    });
    var mobileButton = new qx.ui.form.RadioButton(this.tr("Mobile"));
    mobileButton.set({
      model: "mobile",
      appearance: "modeButton"
    });

    this.__buttons = [riaButton, mobileButton];

    this.__group = new qx.ui.form.RadioGroup(riaButton, mobileButton);
    this.__group.bind("modelSelection[0]", this, "mode");

    this.add(new qx.ui.basic.Label(this.tr("Playground")));
    this.add(new qx.ui.core.Spacer(30));
    this.add(riaButton);
    this.add(mobileButton);
    this.add(new qx.ui.core.Spacer(), { flex : 1 });
    this.add(new qx.ui.basic.Label(versionTag).set({font: "bold"}));
  },


  properties : {
    mode : {
      event : "changeMode",
      check : "String",
      init : "RIA",
      apply : "_applyMode"
    }
  },


  members : {
    __buttons : null,
    __group : null,


    // property apply
    _applyMode : function(value) {
      for (var i=0; i < this.__buttons.length; i++) {
        if (this.__buttons[i].getModel() == value) {
          this.__group.setSelection([this.__buttons[i]]);
          return;
        }
      };
    }
  }
});