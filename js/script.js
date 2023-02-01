window.onload = main;

function main() {
    var app = new Mandelbrot();

    app.render();
}

class Complex {
    constructor(a, b) {
        this.r = a;
        this.i = b;
    }

    static add(a, b) {
        return new Complex(a.r + b.r, a.i + b.i);
    }

    static mult(a, b) {
        var r = (a.r * b.r) - (a.i * b.i);
        var i = (a.r * b.i) + (a.i * b.r);
        return new Complex(r, i);
    }

    static mag(c) {
        return Math.sqrt(Math.pow(c.r, 2) + Math.pow(c.i, 2));
    }
}

class Mandelbrot {
    constructor() {
        // Canvas properties
        this.canvas = document.querySelector("#fractal-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.renderCanvas = document.createElement("canvas");
        this.rctx = this.renderCanvas.getContext("2d");
        this.renderScaleFactor = 1;
        // Initial sizing for canvases
        this.resizeCanvas(this.canvas, this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.resizeCanvas(this.renderCanvas, this.canvas.width * this.renderScaleFactor, this.canvas.height * this.renderScaleFactor);

        // DOM UI properties
        this.ui = document.querySelector("#ui");
        this.renderInput = ui.querySelector("#render-scale");
        this.iterationsInput = ui.querySelector("#iterations input")
        this.mouseCoordOutput = {
            x: ui.querySelector("#offset-output #oo-x"),
            y: ui.querySelector("#offset-output #oo-y")
        }
        this.scale = 1; // Tracks ongoing zoom level between renders
        this.scaleOutput = ui.querySelector("#scale-output #scale");
        this.renderButton = ui.querySelector("#submit");

        // Complex plane transformation properties
        this.viewportCoords = {
            x: -3.1,
            y: 1.27,
            w: 5
        }
        this.resetComplexTransform();
        this.mouseCoords = new DOMPoint(); // Used to track last mouse position for mousemove event

        // Display properties
        this.maxIterations = 250;
        this.colorWidth = 16;
        this.numColors = 3;

        // Event Flags
        this.isRendering = false;
        this.isDragging = false;

        this.initEvents();
    }

    // Utility called by constructor for setting canvas widths according 
    resizeCanvas(c, w, h) {
        c.width = w;
        c.height = h;
    }

    refreshDisplay() {
        this.ctx.save();
        this.ctx.setTransform(1,0,0,1,0,0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        this.ctx.drawImage(this.renderCanvas, 0, 0, this.canvas.width, this.canvas.height);
    }

    initEvents() {
        // Set dragging flag on mouse click, translate display canvas on drag
        this.canvas.addEventListener("mousedown", e => {this.isDragging = true});
        this.canvas.addEventListener("mouseup", e => {this.isDragging = false});
        this.canvas.addEventListener("mousemove", e => {
            this.mouseCoords.x = e.offsetX;
            this.mouseCoords.y = e.offsetY;

            var complexCoords = this.getComplexCoords(this.mouseCoords);

            this.mouseCoordOutput.x.innerHTML = complexCoords.x;
            this.mouseCoordOutput.y.innerHTML = complexCoords.y;

            if(this.isDragging && !this.isRendering) {
                var scale = this.ctx.getTransform().a;
                this.ctx.translate(e.movementX / scale, e.movementY / scale);
                this.refreshDisplay();
            }
        })

        // Zoom image on mouse wheel
        this.canvas.addEventListener("wheel", e => {
            var scaleFactor;
            // Change scaleFactor of image
            e.deltaY < 0 ? scaleFactor = 1.1 : scaleFactor = 0.9;

            // Get transformation matrix for display canvas (note inverse)
            var matrix = this.ctx.getTransform().invertSelf();
            // Convert mouse position to canvas space
            var mousePos = this.mouseCoords.matrixTransform(matrix);
            // Zoom to cursor position (translate, scale, translate)
            this.ctx.translate(mousePos.x, mousePos.y);
            this.ctx.scale(scaleFactor, scaleFactor);
            this.ctx.translate(-mousePos.x, -mousePos.y);

            this.scale *= scaleFactor;
            this.scaleOutput.innerHTML = Math.round(this.scale) + "x";
            this.refreshDisplay();
        })

        this.renderInput.addEventListener("change", e => {

        })

        this.renderButton.addEventListener("click", e => {
            if(!this.isRendering) {this.render();}
        })
    }

    // Renders Mandelbrot set to display canvas
    render() {
        this.isRendering = true;

        this.updateSettings();
        this.resizeCanvas(this.renderCanvas, this.canvas.width * this.renderScaleFactor, this.canvas.height * this.renderScaleFactor);

        const displayMatrix = this.ctx.getTransform();

        // Find coordinate in complex space of screen origin
        var complexOrigin = this.getComplexCoords(new DOMPoint(0, 0));

        // Change viewport values for new scale
        this.viewportCoords.x = complexOrigin.x;
        this.viewportCoords.y = -complexOrigin.y;
        this.viewportCoords.w /= displayMatrix.a;

        // Reset display canvas transform and complex transform
        this.ctx.resetTransform();
        this.resetComplexTransform();


        // Create blank image data to size of rendering canvas
        var imageData = this.rctx.createImageData(this.renderCanvas.width, this.renderCanvas.height);

        var pixelStep = this.viewportCoords.w / imageData.width;

        var pixel = 0; // Pixel counter iterates by 1 
                       // Image data 1D array iterates by 4
        for(var i = 0; i < imageData.data.length; i += 4) {
            // Get complex coordinate of pixel given viewport bounds
            var row = Math.floor(pixel / imageData.width);
            var col = pixel % imageData.width;
            var x = this.viewportCoords.x + (pixelStep * col);
            var y = this.viewportCoords.y - (pixelStep * row);
            var coord = new Complex(x, y);

            // Run Mandelbrot sequence on complex coordinate
            // Assign RGB value based on speed of divergence
            var escapeNum = this.iterator(coord, coord, this.maxIterations);
            var color = this.getRGB(escapeNum);
            imageData.data[i + 0] = color.r;
            imageData.data[i + 1] = color.g;
            imageData.data[i + 2] = color.b;
            imageData.data[i + 3] = 255;

            pixel++;
        }

        // Draw to render canvas, then draw to display canvas
        this.renderCanvas.getContext("2d").putImageData(imageData, 0 , 0);
        this.refreshDisplay(); 

        this.isRendering = false;
    }

    // Main loop for render, called on every pixel
    // Returns iteration number if magnitude reaches breakout within maxIterations
    // If value does not reach breakout in maxIterations (and thus is in the set), returns -1
    iterator(z, c, max) {
        var step = z;
        const add_const = c;
        const maxMagnitude = 2;
        for(var j = 0; j < max; j++) {
            var zSquared = Complex.mult(step, step);
            var nextStep = Complex.add(zSquared, add_const);
            var mag = Complex.mag(nextStep);
            
            if(mag > maxMagnitude) {
                return j;
            } else {
                step = nextStep;
            }
        }
        return -1;
    }

    // Returns RGB value according to escape number of pixel
    // Return object format: {r: , g: , b: }
    getRGB(value) {
        // Value IS in Mandelbrot set
        if(value === -1) {return {r: 0, g: 0, b: 0}}

        var category = Math.floor(value / this.colorWidth) % this.numColors;
        var colorVal = (value % this.colorWidth) / this.colorWidth;
    
        if(category == 0) {
            return {
                r: 0,
                g: 0,
                b: Math.pow(colorVal, 1) * 255
            }
        } else if (category == 1) {
            return {
                r: Math.pow(colorVal, 1) * 255,
                g: Math.pow(colorVal, 1) * 255,
                b: 255
            }
        } else if (category == 2) {
            return {
                r: 255 - Math.pow(colorVal, 1) * 255,
                g: 255 - Math.pow(colorVal, 1) * 255,
                b: 255 - Math.pow(colorVal, 1) * 255
            }
        }
    }

    getComplexCoords(mouseCoords) {
        const displayMatrix = this.ctx.getTransform().invertSelf();

        var imageOrigin = mouseCoords.matrixTransform(displayMatrix);
        var complexOrigin = imageOrigin.matrixTransform(this.complexPlaneTransform);

        return complexOrigin;
    }

    resetComplexTransform() {
        this.complexScaleFactor = this.viewportCoords.w / this.canvas.width;
        this.complexPlaneTransform = new DOMMatrix([
            this.complexScaleFactor, 0, 0, 
            this.complexScaleFactor, 
            this.viewportCoords.x, 
            -this.viewportCoords.y]);
    }

    updateSettings() {
        this.renderScaleFactor = parseInt(this.renderInput.querySelector("input[name='render']:checked").value);
        this.maxIterations = this.iterationsInput.value;
    }
}

function resetCanvasBitmap(canvas, w, h) {
    canvas.width = w;
    canvas.height = h;
}