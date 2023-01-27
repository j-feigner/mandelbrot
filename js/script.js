window.onload = main;

function main() {
    var app = new Mandelbrot();

    app.render();
}

function mandelbrot(c, ctx) {
    // Dimensions of viewport in pixels
    var width = c.width;
    var height = c.height;

    var viewportRect = {
        x: -3.1,
        y: 1.27,
        w: 5,
        h: 2
    }

    var canvasImageData = ctx.createImageData(2 * width, 2 * height);

    var pixelStep = viewportRect.w / canvasImageData.width;
    var pixel = 0;
    for(var i = 0; i < canvasImageData.data.length; i += 4) {
        // Get complex coordinate of pixel given viewport bounds
        var row = Math.floor(pixel / canvasImageData.width);
        var col = pixel % canvasImageData.width;
        var x = viewportRect.x + (pixelStep * col);
        var y = viewportRect.y - (pixelStep * row);

        // Run Mandelbrot sequence on complex coordinate
        // Assign RGB value based on speed of divergence
        var c = new Complex(x, y);
        var maxIterations = 100;
        var escapeNum = mandelbrotSeq(c, maxIterations);
        
        if(escapeNum != -1) {
            try {
                var color = getRGB(escapeNum);
                canvasImageData.data[i + 0] = color.r;
                canvasImageData.data[i + 1] = color.g;
                canvasImageData.data[i + 2] = color.b;
                canvasImageData.data[i + 3] = 255;
            } catch (error) {
                console.log(error + "Attempted escape number: " + escapeNum);
            }
        } else {
            canvasImageData.data[i + 0] = 0;
            canvasImageData.data[i + 1] = 0;
            canvasImageData.data[i + 2] = 0;
            canvasImageData.data[i + 3] = 255;
        }

        pixel++;
    }

    var renderCanvas = document.createElement("canvas");
    renderCanvas.width = canvasImageData.width;
    renderCanvas.height = canvasImageData.height;
    renderCanvas.getContext("2d").putImageData(canvasImageData, 0 , 0);
    ctx.drawImage(renderCanvas, 0, 0, width, height);
}

function mandelbrotSeq(c, maxIterations) {
    var step = c;
    var maxMagnitude = 10;
    for(var j = 0; j < maxIterations; j++) {
        var zSquared = Complex.mult(step, step);
        var nextStep = Complex.add(zSquared, c);
        var mag = Complex.mag(nextStep);
        
        if(mag > maxMagnitude) {
            return j;
        } else {
            step = nextStep;
        }
    }
    return -1;
}

function getRGB(value) {
    var categorySize = 16;
    var category = Math.floor(value / categorySize) % 3;

    var colorVal = (value % categorySize) / categorySize;

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
    }

    // Utility called by constructor for setting canvas widths according 
    resizeCanvas(c, w, h) {
        c.width = w;
        c.height = h;
    }

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
            if(escapeNum != -1) {
                var color = getRGB(escapeNum);
                imageData.data[i + 0] = color.r;
                imageData.data[i + 1] = color.g;
                imageData.data[i + 2] = color.b;
                imageData.data[i + 3] = 255;
            } else {
                imageData.data[i + 0] = 0;
                imageData.data[i + 1] = 0;
                imageData.data[i + 2] = 0;
                imageData.data[i + 3] = 255;
            }

            pixel++;
        }

        // Draw to render canvas, then draw to display canvas
        this.renderCanvas.getContext("2d").putImageData(imageData, 0 , 0);
        this.ctx.drawImage(this.renderCanvas, 0, 0, this.canvas.width, this.canvas.height); 
    }

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
}

function resetCanvasBitmap(canvas, w, h) {
    canvas.width = w;
    canvas.height = h;
}