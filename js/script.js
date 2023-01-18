window.onload = main;

function main() {
    var c = document.querySelector("#fractal-canvas");
    var ctx = c.getContext("2d");

    resetCanvasBitmap(c);

    mandelbrot(c, ctx);
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
        var maxIterations = 1000;
        var escapeNum = mandelbrotSeq(c, maxIterations);
        
        if(escapeNum != -1) {
            try {
                var color = getRGB(maxIterations, escapeNum);
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
    var step = new Complex(0, 0);
    var maxMagnitude = 1000;
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

function getRGB(range, value) {
    var categorySize = 18;
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

function resetCanvasBitmap(canvas) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
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