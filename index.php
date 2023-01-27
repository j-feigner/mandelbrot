<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Mandelbrot Fractal</title>
        <link rel="stylesheet" href="./css/style.css">
    </head>
    <body>
        <div id="site-wrapper">
            <canvas id="fractal-canvas"></canvas>
            <div id="ui">
                <div id="render-scale">
                    <span>Render Quality: </span>
                    <label>
                        <input type="radio" name="render" value="1">
                        1x
                    </label>
                    <label>
                        <input type="radio" name="render" value="2" checked="checked">
                        2x
                    </label>
                    <label>
                        <input type="radio" name="render" value="4">
                        4x
                    </label>
                </div>
                <div id="iterations">
                    <label>
                        Iterations:
                        <input type="number" name="iteration-count" min="1" max="5000" value="100">
                    </label>
                </div>
                <div id="iteration-delay">
                    <label>Iteration Delay: 1000ms</label>
                </div>
                <div id="submit">
                    <button>Go!</button>
                </div>
            </div>
        </div>
        <script src="./js/script.js"></script>
    </body>
</html>