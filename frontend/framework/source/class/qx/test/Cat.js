qx.Class.define("qx.test.Cat",
{
  extend : qx.test.Animal,


  /**
   * TODOC
   *
   * @type constructor
   */
  construct : function()
  {
    this.base(arguments);

    this.debug("Static property: " + arguments.callee.self.static_prop1);
  },

  statics :
  {
    /** {var} TODOC */
    static_prop1 : 3.141,


    /**
     * TODOC
     *
     * @type static
     * @return {call} TODOC
     */
    doSomething : function() {
      return this.doSomethingElse();
    },


    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    doSomethingElse : function() {
      return this.static_prop1;
    }
  },

  properties :
  {
    color :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "brown"
    }
  },

  members :
  {
    /** {var} TODOC */
    name : "",


    /**
     * This is the documentation for the makeSound function
     *
     * @type member
     * @param foo {String} foooo
     * @return {Boolean} always true
     */
    makeSound : function(foo) {
      this.debug("MEOW! MEOW!");
      return true;
    },


    /**
     * This is the documentation for the play function
     *
     * @type member
     * @return {void}
     */
    play : function()
    {
      this.debug("Don't know how to play! [1] (" + arguments.callee.self.static_prop1 + ")");
      this.debug("Don't know how to play! [2] (" + this.self(arguments).static_prop1 + ")");
      this.debug("Don't know how to play! [3] (" + this.self(arguments).doSomethingElse() + ")");
    }
  },


  /**
   * TODOC
   *
   * @type map
   * @param statics {var} TODOC
   * @param members {var} TODOC
   * @param properties {var} TODOC
   * @return {void}
   */
  defer : function(statics, members, properties)
  {
    members.fooBar = members.makeSound;

    properties.add("sound",
    {
      _legacy : true,
      type   : "string"
    });
  }
});
