/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(core)
#use(qx.core.Init)
#require(qx.core.LegacyProperty)
#require(qx.core.Property)
#resource(static:static)

************************************************************************ */

/**
 * The qooxdoo root class. All other classes are direct or indirect subclasses of this one.
 *
 * This class contains methods for:
 *
 * * object management (creation and destruction)
 * * generic setter support
 * * user friendly OO interfaces like {@link #self} or {@link #base}
 */
qx.Class.define("qx.core.Object",
{
  extend : Object,
  include : [ qx.locale.MTranslation, qx.log.MLogging, qx.core.MUserData ],




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   *
   * @type constructor
   */
  construct : function()
  {
    this._hashCode = qx.core.Object.__availableHashCode++;

    if (this._autoDispose)
    {
      this.__dbKey = qx.core.Object.__db.length;
      qx.core.Object.__db.push(this);
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** TODOC */
    __availableHashCode : 0,


    /** TODOC */
    __db : [],


    /** TODOC */
    __disposeAll : false,


    /** Internal type */
    $$type : "Object",


    /**
     * Returns an unique identifier for the given object. If such an identifier
     * does not yet exist, create it.
     *
     * @type static
     * @param o {Object} the Object to get the hashcode for
     * @return {Integer} unique identifier for the given object
     */
    toHashCode : function(o)
    {
      if (o._hashCode != null) {
        return o._hashCode;
      }

      return o._hashCode = qx.core.Object.__availableHashCode++;
    },


    /**
     * Returns the database created, but not yet disposed elements.
     * Please be sure to not modify the given array!
     *
     * @type static
     * @internal
     * @return {Array} The database
     */
    getDb : function() {
      return this.__db;
    },


    /**
     * Destructor. This method is called by qooxdoo on object destruction.
     *
     * Any class that holds resources like links to DOM nodes must overwrite
     * this method and free these resources.
     *
     * @type static
     * @return {void}
     */
    dispose : function()
    {
      if (this.__disposed) {
        return;
      }

      this.__disposed = true;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.disposerDebugLevel") >= 1)
        {
          var disposeStart = new Date;
          console.debug("Disposing qooxdoo application...");
        }
      }

      // var vStart = (new Date).valueOf();
      var vObject;

      for (var i=qx.core.Object.__db.length - 1; i>=0; i--)
      {
        vObject = qx.core.Object.__db[i];

        if (vObject && vObject.__disposed === false)
        {
          try
          {
            vObject.dispose();
          }
          catch(ex)
          {
            console.warn("Could not dispose: " + vObject + ": " + ex);
          }
        }
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.disposerDebugLevel") >= 1)
        {
          // check dom
          var elems = document.all ? document.all : document.getElementsByTagName("*");

          console.debug("Checking " + elems.length + " elements for object references...");

          for (var i=0, l=elems.length; i<l; i++)
          {
            var elem = elems[i];

            for (var key in elem)
            {
              try
              {
                if (typeof elem[key] == "object")
                {
                  if (elem[key] instanceof qx.core.Object || elem[key] instanceof Array) {

                    var name = "unknown object";

                    if (elem[key] instanceof qx.core.Object) {
                      name = elem[key].classname + "[" + elem[key].toHashCode() + "]";
                    }

                    console.debug("Attribute '" + key + "' references " + name + " in DOM element: " + elem.tagName);
                  }
                }
              }
              catch(ex)
              {
                // ignore access errors
              }
            }
          }

          console.debug("Disposing done in " + (new Date() - disposeStart) + "ms");
        }
      }
    },


    /**
     * Returns whether a global dispose (page unload) is currently taking place.
     *
     * @type static
     * @return {Boolean} whether a global dispose is taking place.
     */
    inGlobalDispose : function() {
      return qx.core.Object.__disposed;
    }
  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** If the object should automatically be disposed on application unload */
    _autoDispose : true,


    /*
    ---------------------------------------------------------------------------
      BASICS
    ---------------------------------------------------------------------------
    */

    /**
     * Return unique hash code of object
     *
     * @type member
     * @return {Integer} unique hash code of the object
     */
    toHashCode : function() {
      return this._hashCode;
    },


    /**
     * Returns a string represantation of the qooxdoo object.
     *
     * @type member
     * @return {String} string representation of the object
     */
    toString : function()
    {
      if (this.classname) {
        return "[object " + this.classname + "]";
      }

      return "[object Object]";
    },


    /**
     * Call the same method of the super class.
     *
     * @type member
     * @param args {arguments} the arguments variable of the calling method
     * @param varags {var} variable number of arguments passed to the overwritten function
     * @return {var} the return value of the method of the base class.
     */
    base : function(args, varags)
    {
      if (arguments.length === 1) {
        return args.callee.base.call(this);
      } else {
        return args.callee.base.apply(this, Array.prototype.slice.call(arguments, 1));
      }
    },


    /**
     * Returns the static class (to access static members of this class)
     *
     * @type member
     * @param args {arguments} the arguments variable of the calling method
     * @return {var} the return value of the method of the base class.
     */
    self : function(args) {
      return args.callee.self;
    },


    /*
    ---------------------------------------------------------------------------
      COMMON SETTER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets multiple properties at once by using a property list
     *
     * @type member
     * @param data {Map} a map of property values. The key is the name of the property.
     * @return {Object} this instance.
     * @throws an error if the incoming data field is not a map.
     */
    set : function(data)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (typeof data !== "object") {
          throw new Error("Please use a valid hash of property key-values pairs. Incoming value was: '" + data + "'");
        }
      }

      var setter = qx.core.Property.$$method.set;

      for (var prop in data)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (!this[setter[prop]])
          {
            this.error("Generic setter is missing property: " + prop + ". Incoming value was: " + data[prop]);
            continue;
          }
        }

        this[setter[prop]](data[prop]);
      }

      return this;
    },


    /**
     * Style multiple properties at once by using a property list
     *
     * @type member
     * @param data {Map} a map of property values. The key is the name of the property.
     * @return {Object} this instance.
     * @throws an error if the incoming data field is not a map.
     */
    style : function(data)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (typeof data !== "object") {
          throw new Error("Please use a valid hash of property key-values pairs. Incoming value was: '" + data + "'");
        }
      }

      var setter = qx.core.Property.$$method.set;
      var styler = qx.core.Property.$$method.style;

      for (var prop in data)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (!this[setter[prop]] && !this[styler[prop]])
          {
            this.error("Generic setter is missing property: " + prop + ". Incoming value was: " + data[prop]);
            continue;
          }
        }

        if (this[styler[prop]])
        {
          this[styler[prop]](data[prop]);
        }
        else
        {
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            var def = qx.Class.getPropertyDefinition(this.constructor, prop);
            if (!def._legacy) {
              this.warn("Using normal set() for new property: " + prop);
            }
          }

          this[setter[prop]](data[prop]);
        }
      }

      return this;
    },


    /**
     * Style multiple properties at once by using a property list
     *
     * @type member
     * @param data {Map} a map of property values. The key is the name of the property.
     * @return {Object} this instance.
     * @throws an error if the incoming data field is not a map.
     */
    unstyle : function(data)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (typeof data !== "object") {
          throw new Error("Please use a valid hash of property key-values pairs. Incoming value was: '" + data + "'");
        }
      }

      var resetter = qx.core.Property.$$method.reset;
      var unstyler = qx.core.Property.$$method.unstyle;

      for (var prop in data)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (!this[resetter[prop]] && !this[unstyler[prop]])
          {
            this.error("Generic resetter/unstyler is missing property: " + prop + ". Incoming value was: " + data[prop]);
            continue;
          }
        }

        if (this[unstyler[prop]])
        {
          this[unstyler[prop]]();
        }
        else
        {
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            var def = qx.Class.getPropertyDefinition(this.constructor, prop);
            if (!def._legacy) {
              this.warn("Using normal reset() for new property: " + prop);
            }
          }

          this[resetter[prop]]();
        }
      }

      return this;
    },





    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /** TODOC */
    __disposed : false,


    /**
     * Returns true if the object is disposed.
     *
     * @type member
     * @return {Boolean} whether the object has been disposed
     */
    getDisposed : function() {
      return this.__disposed;
    },


    /**
     * Returns true if the object is disposed.
     *
     * @type member
     * @return {Boolean} whether the object has been disposed
     */
    isDisposed : function() {
      return this.__disposed;
    },


    /**
     * Dispose this object
     *
     * @type member
     * @return {void}
     */
    dispose : function()
    {
      // Check first
      if (this.__disposed) {
        return;
      }

      // Mark as disposed (directly, not at end, to omit recursions)
      this.__disposed = true;

      // Debug output
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.disposerDebugLevel") > 1) {
          console.debug("Disposing " + this.classname + "[" + this.toHashCode() + "]");
        }
      }

      // Deconstructor support for classes
      var clazz = this.constructor;
      var mixins;

      while (clazz.superclass)
      {
        // Processing this class...
        if (clazz.$$destructor) {
          clazz.$$destructor.call(this);
        }

        // Destructor support for mixins
        if (clazz.$$includes)
        {
          mixins = clazz.$$flatIncludes;

          for (var i=0, l=mixins.length; i<l; i++)
          {
            if (mixins[i].$$destructor) {
              mixins[i].$$destructor.call(this);
            }
          }
        }

        // Jump up to next super class
        clazz = clazz.superclass;
      }
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Disconnects given fields from instance.
     *
     * @type member
     * @param varargs {arguments} fields to dispose
     */
    _disposeFields : function(varargs)
    {
      var name;

      for (var i=0, l=arguments.length; i<l; i++)
      {
        var name = arguments[i]

        if (this[name] == null) {
          continue;
        }

        if (!this.hasOwnProperty(name))
        {
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (qx.core.Setting.get("qx.disposerDebugLevel") > 1) {
              console.debug(this.classname + " has no own field " + name);
            }
          }

          continue;
        }

        this[name] = null;
      }
    },


    /**
     * Disconnects and disposes given objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @type member
     * @param varargs {arguments} fields to dispose
     */
    _disposeObjects : function(varargs)
    {
      var name;

      for (var i=0, l=arguments.length; i<l; i++)
      {
        var name = arguments[i]

        if (this[name] == null) {
          continue;
        }

        if (!this.hasOwnProperty(name))
        {
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (qx.core.Setting.get("qx.disposerDebugLevel") > 1) {
              console.debug(this.classname + " has no own field " + name);
            }
          }

          continue;
        }

        this[name].dispose();
        this[name] = null;
      }
    },


    /**
     * Disconnects and disposes given objects (deeply) from instance.
     * Works with arrays, maps and qooxdoo objects.
     *
     * @type member
     * @param name {String} field name to dispose
     * @param deep {Number} how deep to following sub objects. Deep=0 means
     *   just the object and all its keys. Deep=1 also dispose deletes the
     *   objects object content.
     */
    _disposeObjectDeep : function(name, deep)
    {
      var name;

      if (this[name] == null) {
        return;
      }

      if (!this.hasOwnProperty(name))
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.disposerDebugLevel") > 1) {
            console.debug(this.classname + " has no own field " + name);
          }
        }

        return;
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.disposerDebugLevel") > 1) {
          console.debug("Dispose Deep: " + name);
        }
      }

      this.__disposeObjectsDeepRecurser(this[name], deep || 0);
      this[name] = null;
    },


    /**
     * Helper method for _disposeObjectDeep. Do the recursive work.
     *
     * @type member
     * @param obj {Object} object to dispose
     * @param deep {Number} how deep to following sub objects. Deep=0 means
     *   just the object and all its keys. Deep=1 also dispose deletes the
     *   objects object content.
     */
    __disposeObjectsDeepRecurser : function(obj, deep)
    {
      // qooxdoo
      if (obj instanceof qx.core.Object)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.disposerDebugLevel") > 2) {
            console.debug("Sending dispose to " + obj.classname);
          }
        }

        obj.dispose();
      }

      // Array
      else if (obj instanceof Array)
      {
        for (var i=0, l=obj.length; i<l; i++)
        {
          var entry = obj[i];

          if (entry == null) {
            continue;
          }

          if (typeof entry == "object")
          {
            if (deep > 0)
            {
              if (qx.core.Variant.isSet("qx.debug", "on"))
              {
                if (qx.core.Setting.get("qx.disposerDebugLevel") > 2) {
                  console.debug("- Deep processing item '" + i + "'");
                }
              }

              this.__disposeObjectsDeepRecurser(entry, deep-1);
            }

            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (qx.core.Setting.get("qx.disposerDebugLevel") > 2) {
                console.debug("- Resetting key (object) '" + key + "'");
              }
            }

            obj[i] = null;
          }
          else if (typeof entry == "function")
          {
            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (qx.core.Setting.get("qx.disposerDebugLevel") > 2) {
                console.debug("- Resetting key (function) '" + key + "'");
              }
            }

            obj[i] = null;
          }
        }
      }

      // Map
      else if (obj instanceof Object)
      {
        for (var key in obj)
        {
          if (obj[key] == null || !obj.hasOwnProperty(key)) {
            continue;
          }

          var entry = obj[key];

          if (typeof entry == "object")
          {
            if (deep > 0)
            {
              if (qx.core.Variant.isSet("qx.debug", "on"))
              {
                if (qx.core.Setting.get("qx.disposerDebugLevel") > 2) {
                  console.debug("- Deep processing key '" + key + "'");
                }
              }

              this.__disposeObjectsDeepRecurser(entry, deep-1);
            }

            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (qx.core.Setting.get("qx.disposerDebugLevel") > 2) {
                console.debug("- Resetting key (object) '" + key + "'");
              }
            }

            obj[key] = null;
          }
          else if (typeof entry == "function")
          {
            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (qx.core.Setting.get("qx.disposerDebugLevel") > 2) {
                console.debug("- Resetting key (function) '" + key + "'");
              }
            }

            obj[key] = null;
          }
        }
      }
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "qx.disposerDebugLevel" : 0
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // Cleanup user data
    this._disposeObjectDeep("_userData", 1);

    // Cleanup properties
    var clazz = this.constructor;
    var properties;
    var store = qx.core.Property.$$store;
    var storeUser = store.user;
    var storeTheme = store.theme;
    var storeComputed = store.computed;
    var storeInit = store.init;

    while(clazz)
    {
      properties = clazz.$$properties;
      if (properties)
      {
        for (var name in properties)
        {
          if (properties[name].dispose) {
            this[storeUser[name]] = this[storeTheme[name]] = this[storeComputed[name]] = this[storeInit[name]] = undefined;
          }
        }
      }

      clazz = clazz.superclass;
    }

    // Delete Entry from Object DB
    if (this.__dbKey != null)
    {
      if (qx.core.Object.__disposeAll) {
        qx.core.Object.__db[this.__dbKey] = null;
      } else {
        delete qx.core.Object.__db[this.__dbKey];
      }
    }

    // Additional checks
    if (qx.core.Variant.isSet("qx.debug", "on"))
    {
      if (qx.core.Setting.get("qx.disposerDebugLevel") > 0)
      {
        for (var vKey in this)
        {
          if (this[vKey] !== null && typeof this[vKey] === "object" && this.constructor.prototype[vKey] === undefined)
          {
            var detail = "";
            if (this.getAppearance) {
              detail = " (" + this.getAppearance() + ")";
            }

            console.warn("Missing destruct definition for '" + vKey + "' in " + this.classname + "[" + this.toHashCode() + "]" + detail);
            delete this[vKey];
          }
        }
      }
    }
  }
});
