window.onload = main;

function main() {
    var c = document.querySelector("#fractal-canvas");
    var ctx = c.getContext("2d");

    resetCanvasBitmap(c);

    //var test = mandelbrotSeq(new Complex(0, 0));

    mandelbrot(c, ctx);
}

function mandelbrot(c, ctx) {
    // Dimensions of viewport in pixels
    var width = c.width;
    var height = c.height;

    var viewportRect = {
        x: -2.5,
        y: 1.2,
        w: 3.6,
        h: 2
    }

    var canvasImageData = ctx.createImageData(width, height);

    var pixelStep = viewportRect.w / width;
    var pixel = 0;
    for(var i = 0; i < canvasImageData.data.length; i += 4) {
        // Get complex coordinate of pixel given viewport bounds
        var row = Math.floor(pixel / width);
        var col = pixel % width;
        var x = viewportRect.x + (pixelStep * col);
        var y = viewportRect.y - (pixelStep * row);

        // Run Mandelbrot sequence on complex coordinate
        // Assign RGB value based on speed of divergence
        var c = new Complex(x, y);
        var maxIterations = 400;
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

    ctx.putImageData(canvasImageData, 0, 0);
}

function mandelbrotSeq(c, maxIterations) {
    var step = new Complex(0, 0);
    var maxMagnitude = 1000000;
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
    var categorySize = range / 2;
    var category = Math.floor(value / categorySize);

    var colorVal = (value % categorySize) / categorySize;
    var easedColorVal = Math.floor((1 - Math.pow(2, -8 * colorVal)) * 255);

    if(category == 0) {
        return {
            r: easedColorVal,
            g: easedColorVal,
            b: easedColorVal
        }
    } else if (category == 1) {
        return {
            r: easedColorVal,
            g: easedColorVal,
            b: easedColorVal
        }
    }
}

function resetCanvasBitmap(canvas) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function tests() {
    var c = new Complex(0.5, 0.5);
    var nextStep = new Complex(0, 0);
    for(var i = 0; i < 10; i++) {
        var zSquared = Complex.mult(nextStep, nextStep);
        var seqStep = Complex.add(zSquared, c);
        var magnitude = Complex.mag(seqStep);
        if(magnitude > 10) {
            return alert("Not in set!");
        }
        nextStep = seqStep;
    }

    return alert("In set!");
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