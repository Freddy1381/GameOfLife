// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];
        this.showOutlines = false;

        // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.surfaceWidth = null;
        this.surfaceHeight = null;

        // Information on camera zoom
        this.cameraOffset = {}
        this.cameraZoom = null;
        this.MAX_ZOOM = null;
        this.MIN_ZOOM = null;
        this.SCROLL_SENSITIVITY = null;

        // Options and the Details
        this.options = options || {
            debugging: false,
        };
    };

    init(ctx) {
        this.ctx = ctx;
        this.surfaceWidth = this.ctx.canvas.width;
        this.surfaceHeight = this.ctx.canvas.height;
        this.cameraOffset = { x: this.surfaceWidth/2, y: this.surfaceHeight/2 };
        this.cameraZoom = 1;
        this.MAX_ZOOM = 5;
        this.MIN_ZOOM = 0.1;
        this.SCROLL_SENSITIVITY = 0.0005;
        this.startInput();
        this.timer = new Timer();
    };

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    };

    startInput() {
        var that = this;

        var getEventLocation = function (e) {
            if (e.touches && e.touches.length == 1) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else if (e.clientX && e.clientY) {
                return { x: e.clientX, y: e.clientY };   
            }
        }

        let isDragging = false;
        let dragStart = {x: 0, y: 0};
        let initialPinchDistance = null;
        let lastZoom = that.cameraZoom;

        var onPointerDown = function (e) {
            isDragging = true;
            dragStart.x = getEventLocation(e).x / that.cameraZoom - that.cameraOffset.x;
            dragStart.y = getEventLocation(e).y / that.cameraZoom - that.cameraOffset.y;
        }
        var onPointerUp = function (e) {
            isDragging = false;
            initialPinchDistance = null;
            lastZoom = that.cameraZoom;
        }
        var onPointerMove = function (e) {
            if (isDragging) {
                that.cameraOffset.x = getEventLocation(e).x / that.cameraZoom - dragStart.x;
                that.cameraOffset.y = getEventLocation(e).y / that.cameraZoom - dragStart.y;
            }
        }
        
        var adjustZoom = function (zoomAmount, zoomFactor) {
            if (!isDragging) {
                if (zoomAmount) {
                    that.cameraZoom += zoomAmount;
                } else if (zoomFactor) {
                    that.cameraZoom = zoomFactor*lastZoom;
                }
                that.cameraZoom = Math.min( that.cameraZoom, that.MAX_ZOOM );
                that.cameraZoom = Math.max( that.cameraZoom, that.MIN_ZOOM );
            }
        }

        this.ctx.canvas.addEventListener('mousedown', onPointerDown);
        this.ctx.canvas.addEventListener('mouseup', onPointerUp);
        this.ctx.canvas.addEventListener('mousemove', onPointerMove);
        this.ctx.canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY * that.SCROLL_SENSITIVITY));
        this.ctx.canvas.addEventListener("contextmenu", function (e) {
            that.rightclick = getEventLocation(e);
            e.preventDefault();
        }, false);
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    draw() {
        this.ctx.translate( this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 );
        this.ctx.scale(this.cameraZoom, this.cameraZoom);
        this.ctx.translate( -this.ctx.canvas.width / 2 + this.cameraOffset.x, -this.ctx.canvas.height / 2 + this.cameraOffset.y );
        // Clear the whole canvas with transparent color (rgba(0, 0, 0, 0))
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Draw latest things first
        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].draw(this.ctx, this);
        }
    };

    update() {
        let entitiesCount = this.entities.length;

        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };

};