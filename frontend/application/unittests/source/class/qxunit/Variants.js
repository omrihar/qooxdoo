/**
#require(qx.core.Client)
*/

qx.Clazz.define("qxunit.Variants", { statics : {

  testBrowserAllDefined: function() {
    debug("test testBrowserAllDefined");

    qx.Clazz.define("qx.test.Browser1", {
          extend: Object,

          construct: function() {},

          members: {
              getName: qx.core.Variant.select("qx.client", {
                  none: function() { return "unknown browser" },
                  gecko: function() { return "Gecko" },
                  mshtml: function() { return "Internet Explorer" },
                  webkit: function() { return "Webkit" },
                  opera: function() { return "Opera" }
              })
          }
      });

      var b = new qx.test.Browser1();

      if (qx.core.Client.getInstance().isGecko()) {
          assertEquals("Gecko", b.getName());
      } else if (qx.core.Client.getInstance().isMshtml()) {
          assertEquals("Internet Explorer", b.getName());
      } else if (qx.core.Client.getInstance().isWebkit()) {
          assertEquals("Webkit", b.getName());
      } else if (qx.core.Client.getInstance().isOpera()) {
          assertEquals("Opera", b.getName());
      }
  },

  testBrowserOrDefined: function() {
    debug("test testBrowserOrDefined");

      qx.Clazz.define("qx.test.Browser2", {
          extend: Object,

          construct: function() {},

          members: {
              getName: qx.core.Variant.select("qx.client", {
                  none: function() { return "unknown browser" },
                  "gecko|mshtml|webkit|opera": function() { return "known browser" }
              })
          }
      });

      var b = new qx.test.Browser2();
      assertEquals("known browser", b.getName());
  },

  testBrowserOneDefined: function() {
    debug("test testBrowserOneDefined");

      qx.Clazz.define("qx.test.Browser3", {
          extend: Object,

          construct: function() {},

          members: {
              getName: qx.core.Variant.select("qx.client", {
                  "none": function() { return "none browser" },
                  "unknown": function() { return "known browser" }
              })
          }
      });

      var b = new qx.test.Browser3();
      assertEquals("none browser", b.getName());
  },

  testInlineSwitch: function() {
    debug("test testInlineSwitch");

    qx.core.Variant.define("test.animal", ["dog", "cat", "snake"], "dog");
    // variant is set to "snake" by the loader script
    assertEquals("snake", qx.core.Variant.get("test.animal"));

    var c;
    if (qx.core.Variant.isSet("test.animal", "dog|snake")) {
      if(qx.core.Variant.isSet("test.animal", "dog")) {
        c = "dog"
      } else {
        c = "snake"
      }
    } else if (qx.core.Variant.isSet("test.animal", "cat")) {
      c = "cat"
    } if (qx.core.Variant.isSet("test.animal", "none")) {
      c = "snake"
    }
    assertEquals(qx.core.Variant.get("test.animal"), c);
  },

  testIfWithComment: function() {
    debug("test testIfWithComment");

    var b;

    /**
     *
     */

    if (qx.core.Variant.isSet("qx.client", "mshtml"))
    {
      b = "mshtml";
    }


    /**
     *
     */

    else if (qx.core.Variant.isSet("qx.client", "gecko"))
    {
      b = "gecko";
    }


    /**
     *
     */

    else if (qx.core.Variant.isSet("qx.client", "webkit"))
    {
      b = "webkit";
    }


    /**
     *
     */

    else if (qx.core.Variant.isSet("qx.client", "opera"))
    {
      b = "opera"
    }
    assertEquals(qx.core.Variant.get("qx.client"), b);



    if (qx.core.Variant.isSet("qx.client", "mshtml"))   // The Microsoft style
    {
      b = "mshtml";
    }
    else // all other browsers
    {
      b = "other";
    }
    if (qx.core.Client.getInstance().isMshtml()) {
      assertEquals("mshtml", b);
    } else {
      assertEquals("other", b);
    }
  },

  testInlineOr: function() {
    debug("test testInlineOr");

    var c;
    if (qx.core.Variant.isSet("qx.client", "mshtml|opera|webkit|gecko"))
    {
      c = "all"
    } else
    {
      c = "unknown"
    }
    assertEquals("all", c);
  },

  testTernary: function() {
    info("Juhu Kinners");
    var a = qx.core.Variant.isSet("qx.client", "mshtml") ? "mshtml" : "other";
    if (qx.core.Client.getInstance().isMshtml()) {
      assertEquals("mshtml", a);
    } else {
      assertEquals("other", a);
    }
  },

  testScope: function() {
    assertUndefined(window.abcdef);
    if (qx.core.Variant.isSet("qx.client", "mshtml|opera|webkit|gecko")) {
      abcdef = "mshtml";
      var g;
    } else {
      var abcdef = "other";
      var f = function() { var y};
      var g,gh;
    }
    assertUndefined(window.abcdef);
  },

  testVariantInElse: function() {
    // this tests a pathological case which cased the generator to produce
    // invalid code
    var i = 1;
    if (true) {
      var i = 3;
    } else if (qx.core.Variant.isSet("qx.client", "mshtml")) {
      debug("");
    }
    i = 2;
    assertEquals(2, i);
  }

}});