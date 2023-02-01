<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Mandelbrot Fractal</title>
        <link rel="stylesheet" href="./css/style.css">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Proza+Libre&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="./css/style.css">
    </head>
    <body>
        <div id="site-wrapper">
            <canvas id="fractal-canvas"></canvas>
            <div id="ui">
                <div id="coordinate-output">
                    <div id="offset-output">
                        <div>
                            <label>Mouse X: </label>
                            <span id="oo-x"></span>
                        </div>
                        <div>
                            <label>Mouse Y: </label>
                            <span id="oo-y"></span>
                        </div>
                    </div>
                    <div id="scale-output">
                        <label>Zoom: </label>
                        <span id="scale"></span>
                    </div>
                </div>
                <div id="render-scale">
                    <span>Render Quality: </span>
                    <label>
                        <input type="radio" name="render" value="1" checked="checked">
                        1x
                    </label>
                    <label>
                        <input type="radio" name="render" value="2">
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
                        <input type="number" name="iteration-count" min="1" max="2000" value="250">
                    </label>
                </div>
                <div id="submit">
                    <button>Render Here</button>
                </div>
            </div>
        </div>
        <script src="./js/script.js"></script>
    </body>
</html>