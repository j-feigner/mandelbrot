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
        this.canvas = document.querySelector("#fractal-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.renderCanvas = document.createElement("canvas");
        this.rCtx = this.renderCanvas.getContext("2d");
        this.renderScaleFactor = 2;

        // Initial sizing for canvases
        this.resizeCanvas(this.canvas, this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.resizeCanvas(this.renderCanvas, this.canvas.width * this.renderScaleFactor, this.canvas.height * this.renderScaleFactor);

        this.viewportCoords = {
            x: -3.1,
            y: 1.27,
            w: 5
        };

        this.maxIterations = 100;
        this.colorWidth = 16;
        this.numColors = 3;
    }

    // Utility called by constructor for setting canvas widths according 
    resizeCanvas(c, w, h) {
        c.width = w;
        c.height = h;
    }

    // Renders Mandelbrot set to display canvas
    render() {
        // Create blank image data to size of rendering canvas
        var imageData = this.rCtx.createImageData(this.renderCanvas.width, this.renderCanvas.height);

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
            var color = getRGB(escapeNum);
            imageData.data[i + 0] = color.r;
            imageData.data[i + 1] = color.g;
            imageData.data[i + 2] = color.b;
            imageData.data[i + 3] = 255;

            pixel++;
        }

        // Draw to render canvas, then draw to display canvas
        this.renderCanvas.getContext("2d").putImageData(imageData, 0 , 0);
        this.ctx.drawImage(this.renderCanvas, 0, 0, this.canvas.width, this.canvas.height); 
    }

    // Main loop for render, called on every pixel
    // Returns iteration number if magnitude reaches breakout within maxIterations
    // If value does not reach breakout in maxIterations (and thus is in the set), returns -1
    iterator(z, c, max) {
        var step = z;
        const add_const = c;
        var maxMagnitude = 10;
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
        if(value === -1) {
            return {
                r: 0,
                g: 0,
                b: 0
            }
        }

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
}

function resetCanvasBitmap(canvas, w, h) {
    canvas.width = w;
    canvas.height = h;
}