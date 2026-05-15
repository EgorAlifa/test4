const LeafletLib = window.L || {};

const DEFAULT_PADDING = 0.1;
const DEFAULT_OPACITY = 1;

LeafletLib.CanvasLayer = LeafletLib.Layer.extend({
    // -- LeafletLib.DomUtil.setTransform override (LeafletLib.DomUtil.setTransform(el, offset, scale)); --
    //    LeafletLib.DomUtil.setTransform(this._canvas, this._offset, this._options.scale);

    // -- Misc Methods --
    options: {
        debug: false,
        padding: DEFAULT_PADDING,
        opacity: DEFAULT_OPACITY
    },

    initialize(options) {
        LeafletLib.Util.setOptions(this, options);
        this._drawing = false;
    },

    onAdd(map) {
        this._map = map;
        this._canvas = LeafletLib.DomUtil.create('canvas', 'leaflet-canvas-layer');

        const size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        LeafletLib.DomUtil.addClass(this._canvas, 'leaflet-zoom-animated'); // Handle zoom animation

        this.getPane().appendChild(this._canvas);
        this._ctx = this._canvas.getContext('2d');
        this._ctx.globalAlpha = this.options.opacity;

        // Add listeners for map events
        map.on('moveend', this._reset, this);
        map.on('resize', this._resize, this);
        map.on('zoom', this._handleZoom, this);

        if (map.options.zoomAnimation && LeafletLib.Browser.any3d) {
            map.on('zoomanim', this._animateZoom, this);
        }

        this._reset(); // Initial draw
    },

    onRemove(map) {
        this.getPane().removeChild(this._canvas);
        map.off('moveend', this._reset, this);
        map.off('resize', this._resize, this);
        map.off('zoom', this._handleZoom, this);
        if (map.options.zoomAnimation) {
            map.off('zoomanim', this._animateZoom, this);
        }
        this._canvas = null;
    },

    addTo(map) {
        map.addLayer(this);
        return this;
    },

    setOpacity(opacity) {
        this.options.opacity = opacity;
        if (this._ctx) {
            this._ctx.globalAlpha = opacity;
        }
        return this;
    },

    _resize(resizeEvent) {
        this._canvas.width = resizeEvent.newSize.x;
        this._canvas.height = resizeEvent.newSize.y;
        if (this._map) {
            this._reset();
        }
    },

    _reset() {
        const topLeft = this._map.containerPointToLayerPoint([0, 0]);
        const size = this._map.getSize();
        
        LeafletLib.DomUtil.setPosition(this._canvas, topLeft);

        if (this._canvas.width !== size.x) {
            this._canvas.width = size.x;
        }
        if (this._canvas.height !== size.y) {
            this._canvas.height = size.y;
        }

        this._redraw();
    },

    _redraw() {
        const size = this._map.getSize();
        const bounds = this._map.getBounds();
        const zoom = this._map.getZoom();

        if (this.options.debug) {
            this._ctx.clearRect(0, 0, size.x, size.y);
            this._ctx.strokeStyle = '#FF0000';
            this._ctx.beginPath();
            this._ctx.moveTo(0, 0);
            this._ctx.lineTo(size.x, size.y);
            this._ctx.stroke();
        }

        const hasOpacity = this.options.opacity != null;
        const isDrawing = this._drawing === true;
        if (this.draw && !isDrawing && hasOpacity) {
            this._drawing = true;
            this.draw(this._ctx, {
                size,
                bounds,
                zoom,
                offset: LeafletLib.DomUtil.getPosition(this._canvas)
            });
            this._drawing = false;
        }
    },

    _handleZoom() {
        // This handles the case where zoom animation is off or not supported
        const mapOptions = this._map.options;
        const hasZoomAnimation = mapOptions.zoomAnimation;
        if (hasZoomAnimation == null || hasZoomAnimation !== true) {
            this._reset();
        }
    },

    _animateZoom(evt) {
        const scale = this._map.getZoomScale(evt.zoom);
        const mapBounds = this._map.getBounds();
        const northWest = mapBounds ? mapBounds.getNorthWest() : null;
        // eslint-disable-next-line no-underscore-dangle
        const offset = northWest ? this._map._latLngToNewLayerPoint(
            northWest, 
            evt.zoom, 
            evt.center
        ) : null;

        if (offset != null) {
            LeafletLib.DomUtil.setTransform(this._canvas, offset, scale);
        }
    },

    // Placeholder for the user to implement their drawing logic
    draw() {
        // Example: ctx.fillRect(0, 0, mapInfo.size.x, mapInfo.size.y);
        // This method should be overridden by the user.
        // It will be called when the map needs repainting.
    }
});

LeafletLib.canvasLayer = (options) => new LeafletLib.CanvasLayer(options);
