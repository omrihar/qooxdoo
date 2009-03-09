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
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * EXPERIMENTAL!
 *
 * The Pane provides a window of a larger virtual grid.
 * 
 * The actual rendering is performed by one or several layers ({@link ILayer}.
 * The pane computes, which cells of the virtual area is visible and instructs
 * the layers to render these cells.
 */
qx.Class.define("qx.ui.virtual.core.Pane",
{
  extend : qx.ui.core.Widget,


  /**
   * @param rowCount {Integer?0} The number of rows of the virtual grid
   * @param columnCount {Integer?0} The number of columns of the virtual grid
   * @param cellHeight {Integer?10} The default cell height
   * @param cellWidth {Integer?10} The default cell width 
   */
  construct : function(rowCount, columnCount, cellHeight, cellWidth)
  {
    this.base(arguments);
    
    this.__rowConfig = new qx.ui.virtual.core.Axis(cellHeight, rowCount);
    this.__columnConfig = new qx.ui.virtual.core.Axis(cellWidth, columnCount);
    
    this.__scrollTop = 0;
    this.__scrollLeft = 0;
    
  
    this.__paneHeight = 0;
    this.__paneWidth = 0;
    
    this.__layerWindow = {};
    this.__jobs = {};
        
    // create layer container. The container does not have a layout manager
    // layers are positioned using "setUserBounds"
    this.__layerContainer = new qx.ui.container.Composite();
    this.__layerContainer.setUserBounds(0, 0, 0, 0);
    this._add(this.__layerContainer);
    
    this.__layers = [];
    
    this.__rowConfig.addListener("change", this.fullUpdate, this);
    this.__columnConfig.addListener("change", this.fullUpdate, this);
    
    this.addListener("resize", this._onResize, this);
    this.addListenerOnce("appear", this._onAppear, this);    

    this.addListener("click", this._onCellClick, this);  
    this.addListener("dblclick", this._onDblclickPane, this);
    this.addListener("contextmenu", this._onContextMenu, this);
  },
   
  
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired if a cell is clicked */
    cellClick : "qx.ui.virtual.core.CellEvent",

    /** Fired if a cell is right-clicked. */
    cellContextmenu : "qx.ui.virtual.core.CellEvent",

    /** Fired if a cell is doubleclicked. */
    cellDblclick : "qx.ui.virtual.core.CellEvent",

    /** Fired on resize of either the container or the (virtual) content. */
    update : "qx.event.type.Event",
        
    /** Fired if the pane is scrolled horizontally */
    scrollX : "qx.event.type.Data",
    
    /** Fired if the pane is scrolled vertically */
    scrollY : "qx.event.type.Data"    
  },
   
  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    width :
    {
      refine : true,
      init : 400
    },


    // overridden
    height :
    {
      refine : true,
      init : 300
    }     
  },   
   
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    DEBUG : false,
    
    
    /*
    ---------------------------------------------------------------------------
      ACCESSOR METHODS
    ---------------------------------------------------------------------------
    */
    
    /**
     * Get the axis object, which defines the row numbers and the row sizes.
     * 
     * @return {Axis} The row configuration
     */
    getRowConfig : function() {
      return this.__rowConfig;
    },
    
    
    /**
     * Get the axis object, which defines the column numbers and the column sizes.
     * 
     * @return {Axis} The column configuration
     */
    getColumnConfig : function() {
      return this.__columnConfig;
    },    
    
    
    /*
    ---------------------------------------------------------------------------
      LAYER MANAGMENT
    ---------------------------------------------------------------------------
    */
    
    /**
     * Returns the layer container
     *
     * @return {qx.ui.core.Widget} The layer container
     */
    getChild : function() {
      return this.__layerContainer;
    },
    
    
    /**
     * Add a layer to the layer container
     * 
     * @param layer {ILayer} the layer to add
     */
    addLayer : function(layer)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.assertInterface(layer, qx.ui.virtual.core.ILayer);
      }

      this.__layers.push(layer);
      layer.setUserBounds(0, 0, 0, 0);
      this.__layerContainer.add(layer);
    },
    
    
    /**
     * Get a list of all layers
     * 
     * @return {ILayer[]} list of the pane's layers
     */
    getLayers : function() {
      return this.__layers;
    },
    
    
    /**
     * Get a list of all visible layers
     * 
     * @return {ILayer[]} list of the pane's visible layers
     */
    getVisibleLayers : function()
    {
      var layers = [];
      for (var i=0; i<this.__layers.length; i++)
      {
        var layer = this.__layers[i];
        if (layer.isVisible()) {
          layers.push(layer);
        }
      }
      return layers;
    },
    
    
    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */
    
    /**
     * The maximum horizontal scroll position.
     *
     * @return {Integer} Maximum horizontal scroll position.
     */
    getScrollMaxX : function()
    {
      var paneSize = this.getBounds();

      if (paneSize) {
        return Math.max(0, this.__columnConfig.getTotalSize() - paneSize.width);
      }

      return 0;
    },


    /**
     * The maximum vertical scroll position.
     *
     * @return {Integer} Maximum vertical scroll position.
     */
    getScrollMaxY : function()
    {
      var paneSize = this.getBounds();

      if (paneSize) {
        return Math.max(0, this.__rowConfig.getTotalSize() - paneSize.height);
      }

      return 0;
    },    
    
    
    /**
     * Scrolls the content to the given left coordinate
     *
     * @param value {Integer} The vertical position to scroll to.
     */    
    setScrollY : function(value)
    {
      var max = this.getScrollMaxY();

      if (value < 0) {
        value = 0;
      } else if (value > max) {
        value = max;
      }
      
      if (this.__scrollTop !== value)
      {        
        var old = this.__scrollTop;
        this.__scrollTop = value;
        this._deferredUpdateScrollPosition();
        this.fireDataEvent("scrollY", value, old);
      }
    },
    
    
    /**
     * Returns the vertical scroll offset.
     * 
     * @return {Integer} The vertical scroll offset
     */
    getScrollY : function() {
      return this.__scrollTop;
    },
    
    
    /**
     * Scrolls the content to the given top coordinate
     *
     * @param value {Integer} The horizontal position to scroll to.
     */     
    setScrollX : function(value)
    {
      var max = this.getScrollMaxX();

      if (value < 0) {
        value = 0;
      } else if (value > max) {
        value = max;
      }
      
      if (value !== this.__scrollLeft)
      {                
        var old = this.__scrollLeft;
        this.__scrollLeft = value;
        this._deferredUpdateScrollPosition();
                
        this.fireDataEvent("scrollX", value, old);
      }
    },

    
    /**
     * Returns the horizontal scroll offset.
     * 
     * @return {Integer} The horizontal scroll offset
     */    
    getScrollX : function() {
      return this.__scrollLeft;
    },

    
    /**
     * The (virtual) size of the content.
     *
     * @return {Map} Size of the content (keys: <code>width</code> and
     *     <code>height</code>)
     */
    getScrollSize : function() 
    {
      return {
        width: this.__columnConfig.getTotalSize(),
        height: this.__rowConfig.getTotalSize()
      }      
    },


    /*
    ---------------------------------------------------------------------------
      SCROLL INTO VIEW SUPPORT
    ---------------------------------------------------------------------------
    */
    
    /**
     * Scrolls a row into the visible area of the pane.
     * 
     * @param row {Integer} The row's index
     */
    scrollRowIntoView : function(row)
    {
      var bounds = this.getBounds();
      if (!bounds) 
      {
        this.addListenerOnce("appear", function() {
          this.scrollRowIntoView(row);
        }, this);
        return;
      }

      var itemTop = this.__rowConfig.getItemPosition(row);
      var itemBottom = itemTop + this.__rowConfig.getItemSize(row);
      var scrollTop = this.getScrollY();

      if (itemTop < scrollTop) {
        this.setScrollY(itemTop);
      } else if (itemBottom > scrollTop + bounds.height) {
        this.setScrollY(itemBottom - bounds.height);
      }
    },

    
    /**
     * Scrolls a column into the visible area of the pane.
     * 
     * @param column {Integer} The column's index
     */    
    scrollColumnIntoView : function(column)
    {
      var bounds = this.getBounds();
      if (!bounds) 
      {
        this.addListenerOnce("appear", function() {
          this.scrollColumnIntoView(column);
        }, this);
        return;
      }

      var itemLeft = this.__columnConfig.getItemPosition(column);
      var itemRight = itemLeft + this.__columnConfig.getItemSize(column);
      var scrollLeft = this.getScrollX();
      
      if (itemLeft < scrollLeft) {
        this.setScrollX(itemLeft);
      } else if (itemRight > scrollLeft + bounds.width) {
        this.setScrollX(itemRight - bounds.width);
      }     
    },

    
    /**
     * Scrolls a grid cell into the visible area of the pane.
     * 
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     */
    scrollCellIntoView : function(column, row)
    {
      var bounds = this.getBounds();
      if (!bounds) 
      {
        this.addListenerOnce("appear", function() {
          this.scrollCellIntoView(column, row);
        }, this);
        return;
      }

      this.scrollColumnIntoView(column);
      this.scrollRowIntoView(row);
    },

    
    /*
    ---------------------------------------------------------------------------
      CELL SUPPORT
    ---------------------------------------------------------------------------
    */
    
    /**
     * Get the grid cell at the given absolute document coordinates. This method
     * can be used to convert the mouse position returned by 
     * {@link qx.event.type.Mouse#getDocumentLeft} and 
     * {@link qx.event.type.Mouse#getDocumentLeft} into cell coordinates.
     * 
     * @param documentX {Integer} The x coordinate relative to the viewport
     *    origin.
     * @param documentY {Integer} The y coordinate relative to the viewport
     *    origin.
     * @return {Map} A map containing th <code>row</code> and <code>column</code>
     *    of the found cell. If the coordinate is outside of the pane's bounds
     *    of there is no cell at the coordinate the values of row and column
     *    are <code>null</code>.
     */
    getCellAtPosition: function(documentX, documentY)
    {
      var row, column;
      var paneLocation = this.getContentLocation();

      if (
        documentY < paneLocation.top ||
        documentY >= paneLocation.bottom ||
        documentX < paneLocation.left ||
        documentX >= paneLocation.right
      ) {
        return {
          row : null,
          column : null
        };
      }

      row = this.__rowConfig.getItemAtPosition(
        this.getScrollY() + documentY - paneLocation.top
      ).index;

      column = this.__columnConfig.getItemAtPosition(
        this.getScrollX() + documentX - paneLocation.left
      ).index;

      return {
        row : row,
        column : column
      };
    },


    /*
    ---------------------------------------------------------------------------
      PREFETCH SUPPORT
    ---------------------------------------------------------------------------
    */
    
    /**
     * Increase the layers width beyond the needed width to improve 
     * horizontal scrolling. The layers are only resized if invisible parts
     * left/right of the pane window are smaller than minLeft/minRight.
     * 
     * @param minLeft {Integer} Only prefetch if the invisible part left of the
     *    pane window if smaller than this (pixel) value
     * @param maxLeft {Integer} The amount of pixel the layers should reach
     *    left of the pane window
     * @param minRight {Integer} Only prefetch if the invisible part right of the
     *    pane window if smaller than this (pixel) value
     * @param maxRight {Integer} The amount of pixel the layers should reach
     *    right of the pane window
     */    
    prefetchX : function(minLeft, maxLeft, minRight, maxRight)
    {
      var layers = this.getVisibleLayers();
      if (layers.length == 0) {
        return;
      }   
      
      var bounds = this.getBounds();
      if (!bounds) {
        return;
      }

      var paneRight = this.__scrollLeft + bounds.width;
      var rightAvailable = this.__paneWidth - paneRight;
      if (
        this.__scrollLeft - this.__layerWindow.left  < Math.min(this.__scrollLeft, minLeft) ||
        this.__layerWindow.right - paneRight < Math.min(rightAvailable, minRight)
      )
      {      
        this.DEBUG && console.log("prefetch x");
        var left = Math.min(this.__scrollLeft, maxLeft); 
        var right = Math.min(rightAvailable, maxRight)
        this._setLayerWindow(
          layers,
          this.__scrollLeft - left,
          this.__scrollTop,
          bounds.width + left + right,
          bounds.height,
          false
        );
      }
    },
    
    
    /**
     * Increase the layers height beyond the needed height to improve 
     * vertical scrolling. The layers are only resized if invisible parts
     * above/below the pane window are smaller than minAbove/minBelow.
     * 
     * @param minAbove {Integer} Only prefetch if the invisible part above the
     *    pane window if smaller than this (pixel) value
     * @param maxAbove {Integer} The amount of pixel the layers should reach
     *    above the pane window
     * @param minBelow {Integer} Only prefetch if the invisible part below the
     *    pane window if smaller than this (pixel) value
     * @param maxBelow {Integer} The amount of pixel the layers should reach
     *    below the pane window
     */
    prefetchY : function(minAbove, maxAbove, minBelow, maxBelow)
    {
      var layers = this.getVisibleLayers();
      if (layers.length == 0) {
        return;
      }   
      
      var bounds = this.getBounds();
      if (!bounds) {
        return;
      }

      var paneBottom = this.__scrollTop + bounds.height;
      var belowAvailable = this.__paneHeight - paneBottom;
      if (
        this.__scrollTop - this.__layerWindow.top  < Math.min(this.__scrollTop, minAbove) ||
        this.__layerWindow.bottom - paneBottom < Math.min(belowAvailable, minBelow)
      )
      {      
        this.DEBUG && console.log("prefetch y");
        var above = Math.min(this.__scrollTop, maxAbove); 
        var below = Math.min(belowAvailable, maxBelow)
        this._setLayerWindow(
          layers,
          this.__scrollLeft,
          this.__scrollTop - above,
          bounds.width,
          bounds.height + above + below,
          false
        );
      }
    },
    
    
    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER
    ---------------------------------------------------------------------------
    */
    
    /**
     * Resize event handler.
     * 
     * Updates the visible window
     */
    _onResize : function() 
    {
      if (this.getContainerElement().getDomElement()) 
      {        
        this.__dontFireUpdate = true;
        this._updateScrollPosition();
        this.__dontFireUpdate = null;
        this.fireEvent("update");
      }
    },
    
    
    /**
     * Resize event handler. Do a full update on first appear.
     */
    _onAppear : function() {
      this.fullUpdate();
    },
    
    
    /**
     * Event listener for mouse clicks. Fires an cellClick event.
     * @param e {qx.event.type.Mouse} The incoming mouse event.
     */
    _onCellClick : function(e)
    {
      var coords = this.__getCoords(e);
      this.fireEvent("cellClick", qx.ui.virtual.core.CellEvent, [this, e, coords.row, coords.column], true);
    },

    
    /**
     * Event listener for context menu clicks. Fires an cellContextmenu event.
     * @param e {qx.event.type.Mouse} The incoming mouse event.
     */
    _onContextMenu : function(e)
    {
      var coords = this.__getCoords(e);
      this.fireEvent("cellContextmenu", qx.ui.virtual.core.CellEvent, [this, e, coords.row, coords.column], true);
    },

    
    /**
     * Event listener for double clicks. Fires an cellDblclick event.
     * @param e {qx.event.type.Mouse} The incoming mouse event.
     */
    _onDblclickPane : function(e)
    {
      var coords = this.__getCoords(e);
      this.fireEvent("cellDblclick", qx.ui.virtual.core.CellEvent, [this, e, coords.row, coords.column], true);
    },

    
    /**
     * Helper function to convert mouse coordinates into cell corrdinates.
     * @param e {qx.event.type.Mouse} The incoming mouse event.
     * @return {Map} An map containing row and column.
     */
    __getCoords : function(e) {
      return this.getCellAtPosition(e.getDocumentLeft(), e.getDocumentTop());
    },
    
    
    /*
    ---------------------------------------------------------------------------
      PANE UPDATE
    ---------------------------------------------------------------------------
    */
    
    // overridden
    syncWidget : function()
    {
      if (this.__jobs._fullUpdate) {
        this._fullUpdate();
      } else if (this.__jobs._updateScrollPosition) {
        this._updateScrollPosition();
      }
      this.__jobs = {};
    },
    
    
    /**
     * Sets the size of the layers to contain the cells at the pixel position
     * "left/right" up to "left+minHeight/right+minHeight". The offset of the
     * layer container is adjusted to respect the pane's scroll top and scroll
     * left values. 
     * 
     * @param layers {ILayer[]} list of layers to update
     * @param left {Integer} maximum left pixel coordinate of the layers
     * @param top {Integer} maximum top pixel coordinate of the layers
     * @param minWidth {Integer} the minimum end coordinate of the layers will 
     *    be larger than <code>left+minWidth</code>. 
     * @param minHeight {Integer} the minimum end coordinate of the layers will 
     *    be larger than <code>top+minHeight</code>. 
     * @param doFullUpdate {Boolean?false} Whether a full update on the layer
     *    should be performed of if only the layer window should be updated.
     */
    _setLayerWindow : function(layers, left, top, minWidth, minHeight, doFullUpdate)
    {
      var rowCellData = this.__rowConfig.getItemAtPosition(top);
      var columnCellData = this.__columnConfig.getItemAtPosition(left);
           
      var firstRow = rowCellData.index;
      var firstColumn = columnCellData.index;
      
      var rowSizes = this.__rowConfig.getItemSizes(firstRow, minHeight + rowCellData.offset);
      var columnSizes = this.__columnConfig.getItemSizes(firstColumn, minWidth + columnCellData.offset);

      var lastRow = firstRow + rowSizes.length - 1;
      var lastColumn = firstColumn + columnSizes.length - 1;

      var layerWidth = qx.lang.Array.sum(columnSizes);
      var layerHeight = qx.lang.Array.sum(rowSizes);

      this.__layerWindow = {
        top: top - rowCellData.offset,
        bottom: top - rowCellData.offset + layerHeight,
        left: left - columnCellData.offset,        
        right: left - columnCellData.offset + layerWidth
      }      
      
      this.__layerContainer.setUserBounds(
        this.__layerWindow.left - this.__scrollLeft,
        this.__layerWindow.top - this.__scrollTop,
        layerWidth, layerHeight
      );            
           
      this.__columnSizes = columnSizes;
      this.__rowSizes = rowSizes;
      
      // TODO: debugging code
      this.DEBUG && qx.ui.core.queue.Manager.flush();      

      for (var i=0; i<this.__layers.length; i++) 
      {
        var start = new Date();
        
        var layer = this.__layers[i];
        layer.setUserBounds(0, 0, layerWidth, layerHeight);
        
        if (doFullUpdate) {
          layer.fullUpdate(
            firstRow, lastRow, 
            firstColumn, lastColumn, 
            rowSizes, columnSizes              
          );
        } else {
          layer.updateLayerWindow(
            firstRow, lastRow, 
            firstColumn, lastColumn, 
            rowSizes, columnSizes
          );
        }

        // TODO: debugging code    
        if(this.DEBUG)
        {
          this.debug("layer update ("+layer.classname+"): " + (new Date() - start) + "ms");
          var start = new Date();
          qx.ui.core.queue.Manager.flush();
          this.debug("layer flush ("+layer.classname+"): " + (new Date() - start) + "ms");
        }
      }            
    },    
    
    
    
    /**
     * Check whether the pane was resized and fire an {@link #update} event if
     * it was.
     */
    __checkPaneResize : function()
    {
      if (this.__dontFireUpdate) {
        return;
      }
      
      var scrollSize = this.getScrollSize();
      if (
        this.__paneHeight !== scrollSize.height ||
        this.__paneWidth !== scrollSize.width
      ) 
      {
        this.__paneHeight = scrollSize.height;
        this.__paneWidth = scrollSize.width;  
        this.fireEvent("update");
      }      
    },
        
    
    /**
     * Schedule a full update on all visible layers. 
     */
    fullUpdate : function()
    {
      this.__jobs._fullUpdate = 1;
      qx.ui.core.queue.Widget.add(this);
    },       
    
    
    /**
     * Whether a full update is scheduled
     * 
     * @return {Boolean} Whether a full update is scheduled
     */
    isUpdatePending : function() {
      return !!this.__jobs._fullUpdate;
    },
    
    
    /**
     * Perform a full update on all visible layers. All cached data will be 
     * discarded.
     */
    _fullUpdate : function()
    {
      var layers = this.getVisibleLayers();
      if (layers.length == 0)
      {
        this.__checkPaneResize();
        return;
      }

      if (!this.getContainerElement().getDomElement()) {
        return; // the pane has not yet been rendered -> wait for the appear event
      }
      
      var bounds = this.getBounds();
     
      this.DEBUG && console.log("full update");
      this._setLayerWindow(
        layers,
        this.__scrollLeft, this.__scrollTop,
        bounds.width, bounds.height,
        true
      );
             
      this.__checkPaneResize();
    },
    
    
    /**
     * Schedule an update the visible window of the grid according to the top 
     * and left scroll positions. 
     */
    _deferredUpdateScrollPosition : function()
    {
      this.__jobs._updateScrollPosition = 1;
      qx.ui.core.queue.Widget.add(this);
    }, 
    
    
    /**
     * Update the visible window of the grid according to the top and left scroll
     * positions. 
     */
    _updateScrollPosition : function() 
    {
      var layers = this.getVisibleLayers();
      if (layers.length == 0) 
      {
        this.__checkPaneResize();
        return;
      }
      
      var bounds = this.getBounds();
      if (!bounds) {
        return; // the pane has not yet been rendered -> wait for the appear event
      }                      
      
      // the visible window of the virtual coordinate space
      var paneWindow = {
        top: this.__scrollTop,
        bottom: this.__scrollTop + bounds.height,
        left: this.__scrollLeft,
        right: this.__scrollLeft + bounds.width
      };
      
      if (
        this.__layerWindow.top <= paneWindow.top &&
        this.__layerWindow.bottom >= paneWindow.bottom && 
        this.__layerWindow.left <= paneWindow.left &&
        this.__layerWindow.right >= paneWindow.right
      )
      {
        this.DEBUG && console.log("scroll");
        // only update layer container offset
        this.__layerContainer.setUserBounds(          
          this.__layerWindow.left - paneWindow.left,
          this.__layerWindow.top - paneWindow.top,
          this.__layerWindow.right - this.__layerWindow.left,
          this.__layerWindow.bottom - this.__layerWindow.top
        );              
      }
      else
      {
        this.DEBUG && console.log("update layer window");
        this._setLayerWindow(
          layers,
          this.__scrollLeft, this.__scrollTop,
          bounds.width, bounds.height,
          false
        )
      }
      
      this.__checkPaneResize();
    }
  },
  
  
  destruct : function() 
  {
    this._disposeArray("__layers");
    this._disposeObjects("__rowConfig", "__columnConfig");
  }
});
