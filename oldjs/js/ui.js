define(["require", "exports", "util", "jquery"], function (require, exports, util, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var activeCanvas;
    var bufferCanvas;
    var context;
    var buffer;
    var scale;
    var xOffset = 0;
    var yOffset = 0;
    var fpsBody;
    var imageCache = [];
    var width;
    var height;
    var viewPort = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        tileScale: 64 // 100 meters = 1 tile = 64 pixels
    };
    function init() {
        activeCanvas = $('#game');
        bufferCanvas = $('#buffer');
        context = activeCanvas[0].getContext('2d');
        buffer = bufferCanvas[0].getContext('2d');
        fpsBody = $('#fpsBody');
        viewPort.width = activeCanvas.width();
        viewPort.height = activeCanvas.height();
        buffer.imageSmoothingEnabled = false;
        // Preload common images
        var images = [
            'assets/caravel_wake.png'
        ];
        for (var i of images) {
            imageCache[i] = new Image();
            imageCache[i].src = i;
        }
    }
    exports.init = init;
    function getWidth() {
        if (!width)
            width = $('#game').width();
        return width;
    }
    exports.getWidth = getWidth;
    function getHeight() {
        if (!height)
            height = $('#game').height();
        return height;
    }
    exports.getHeight = getHeight;
    function getViewPort() {
        return viewPort;
    }
    exports.getViewPort = getViewPort;
    function centerViewPort(x, y, worldWidth, worldHeight) {
        x *= viewPort.tileScale;
        y *= viewPort.tileScale;
        viewPort.x = x - (viewPort.width / 2);
        viewPort.y = y - (viewPort.height / 2);
        // Side cases
        if (viewPort.x < 0)
            viewPort.x = 0;
        if (viewPort.y < 0)
            viewPort.y = 0;
        if (viewPort.x + viewPort.width > worldWidth * viewPort.tileScale)
            viewPort.x = worldWidth * viewPort.tileScale - viewPort.width;
        if (viewPort.y + viewPort.height > worldHeight * viewPort.tileScale)
            viewPort.y = worldHeight * viewPort.tileScale - viewPort.height;
    }
    exports.centerViewPort = centerViewPort;
    function isOnScreen(x, y, width, height) {
        x *= viewPort.tileScale;
        y *= viewPort.tileScale;
        width *= viewPort.tileScale;
        height *= viewPort.tileScale;
        return x - Math.abs(xOffset) < (viewPort.x + viewPort.width)
            && y - Math.abs(yOffset) < (viewPort.y + viewPort.height)
            && x + xOffset + width > viewPort.x
            && y + yOffset + height > viewPort.y;
    }
    exports.isOnScreen = isOnScreen;
    function getVisibleTileArea() {
        var area = {
            x: Math.floor((viewPort.x + xOffset) / viewPort.tileScale) - 1,
            y: Math.floor((viewPort.y + yOffset) / viewPort.tileScale) - 1,
            width: 0,
            height: 0
        };
        if (area.x < 0)
            area.x = 0;
        if (area.y < 0)
            area.y = 0;
        area.width = area.x + Math.ceil(viewPort.width / viewPort.tileScale) + 2;
        area.height = area.y + Math.ceil(viewPort.height / viewPort.tileScale) + 2;
        return area;
    }
    exports.getVisibleTileArea = getVisibleTileArea;
    function setOffset(x, y) {
        xOffset = x;
        yOffset = y;
    }
    exports.setOffset = setOffset;
    function setAA(newValue) {
        buffer.imageSmoothingEnabled = newValue;
    }
    exports.setAA = setAA;
    function drawRect(x, y, width, height, color) {
        buffer.beginPath();
        buffer.fillStyle = color.rgba;
        // Start with x,y on original canvas
        // Translate by the viewPort x,y
        // Scale to fill viewPort
        buffer.rect(x, y, width, height);
        buffer.fill();
        buffer.closePath();
    }
    exports.drawRect = drawRect;
    function drawRectRel(x, y, width, height, color) {
        if (!isOnScreen(x, y, width, height))
            return;
        x *= viewPort.tileScale;
        y *= viewPort.tileScale;
        width *= viewPort.tileScale;
        height *= viewPort.tileScale;
        buffer.beginPath();
        buffer.fillStyle = color.rgba;
        // Start with x,y on original canvas
        // Translate by the viewPort x,y
        // Scale to fill viewPort
        buffer.rect((x + xOffset - viewPort.x), (y + yOffset - viewPort.y), width, height);
        buffer.fill();
        buffer.closePath();
    }
    exports.drawRectRel = drawRectRel;
    function drawImageRel(x, y, width, height, url, degrees = 0, opacity = 1) {
        drawSpriteRel(x, y, width, height, 0, 0, 0, 0, url, degrees, opacity);
    }
    exports.drawImageRel = drawImageRel;
    function drawSprite(x, y, width, height, dx, dy, dwidth, dheight, url, degrees = 0, opacity = 1) {
        if (!imageCache[url]) {
            console.log('Loaded ' + url);
            imageCache[url] = new Image();
            imageCache[url].src = url;
        }
        buffer.globalAlpha = opacity;
        if (dwidth == 0 && dheight == 0)
            buffer.drawImage(imageCache[url], x, y, width, height);
        else
            buffer.drawImage(imageCache[url], dx, dy, dwidth, dheight, x, y, width, height);
        buffer.globalAlpha = 1;
    }
    exports.drawSprite = drawSprite;
    function drawSpriteRel(x, y, width, height, dx, dy, dwidth, dheight, url, degrees = 0, opacity = 1) {
        if (!isOnScreen(x, y, width, height))
            return;
        x *= viewPort.tileScale;
        y *= viewPort.tileScale;
        width *= viewPort.tileScale;
        height *= viewPort.tileScale;
        //buffer.scale(viewPort.tileScale, viewPort.tileScale);
        if (!imageCache[url]) {
            console.log('Loaded ' + url);
            imageCache[url] = new Image();
            imageCache[url].src = url;
        }
        buffer.globalAlpha = opacity;
        if (degrees != 0) {
            buffer.save();
            buffer.translate(x + (width / 2) + xOffset - viewPort.x, y + (height / 2) + yOffset - viewPort.y);
            buffer.rotate(Math.PI / 180 * degrees);
            if (dwidth == 0 && dheight == 0)
                buffer.drawImage(imageCache[url], -width / 2, -height / 2, width, height);
            else
                buffer.drawImage(imageCache[url], dx, dy, dwidth, dheight, -width / 2, -height / 2, width, height);
            buffer.restore();
        }
        else {
            if (dwidth == 0 && dheight == 0)
                buffer.drawImage(imageCache[url], (x + xOffset - viewPort.x), (y + yOffset - viewPort.y), width, height);
            else
                buffer.drawImage(imageCache[url], dx, dy, dwidth, dheight, (x + xOffset - viewPort.x), (y + yOffset - viewPort.y), width, height);
        }
        //buffer.scale(1/viewPort.tileScale,1/viewPort.tileScale);
        //buffer.setTransform(1,0,0,1,0,0); // Reset transformation matrix to identity
        buffer.globalAlpha = 1;
    }
    exports.drawSpriteRel = drawSpriteRel;
    function drawText(x, y, text, fontSize, color, centered = false, fontName = 'Courier New') {
        if (DEBUG)
            drawRect(x, y, 5, 5, util.Color.red);
        buffer.beginPath();
        buffer.fillStyle = color.rgba;
        buffer.textAlign = centered ? 'center' : 'left';
        buffer.font = fontSize + 'px ' + fontName;
        buffer.fillText(text, x, y);
        buffer.closePath();
    }
    exports.drawText = drawText;
    function drawTextRel(x, y, text, fontSize, color, centered = false, fontName = 'Courier New') {
        x *= viewPort.tileScale;
        y *= viewPort.tileScale;
        if (x > (viewPort.x + viewPort.width)
            || y > (viewPort.y + viewPort.height)
            || x < viewPort.x
            || y < viewPort.y)
            return; // Check if off-screen before drawing
        buffer.beginPath();
        buffer.fillStyle = color.rgba;
        buffer.textAlign = centered ? 'center' : 'left';
        buffer.font = Math.floor(fontSize * viewPort.tileScale) + 'px ' + fontName;
        buffer.fillText(text, x + xOffset - viewPort.x, y + yOffset - viewPort.y);
        buffer.closePath();
    }
    exports.drawTextRel = drawTextRel;
    function drawBuffer() {
        context.drawImage(bufferCanvas[0], 0, 0);
    }
    exports.drawBuffer = drawBuffer;
    function updateTimes(debugStats, world) {
        var tableBody = '';
        var ec = world.getEntityCount();
        var player = world.getPlayer();
        tableBody += '<tr><th colspan=2>Debug Information</th></tr>';
        tableBody += '<tr><td>TPS</td><td>' + debugStats.getTPS().toFixed(0) + ' fps</td></tr>';
        tableBody += '<tr><td>Delta</td><td>' + debugStats.getDelta() + '</td></tr>';
        tableBody += '<tr><td>Tick</td><td>' + debugStats.lastTwentyTickTimes[0] + ' ms</td></tr>';
        tableBody += '<tr><td>Draw</td><td>' + debugStats.lastTwentyDrawTimes[0] + ' ms</td></tr>';
        tableBody += '<tr><td>Entities</td><td>' + ec.current + '/' + ec.max + '</td></tr>';
        tableBody += '<tr><td>Wind</td><td>0 knots at NNE</td></tr>';
        if (player) {
            tableBody += '<tr><td>X</td><td>' + Math.floor(player.position.x) + '</td></tr>';
            tableBody += '<tr><td>Y</td><td>' + Math.floor(player.position.y) + '</td></tr>';
            tableBody += '<tr><td>Rudder</td><td>' + player.rudder + '/60 deg</td></tr>';
            tableBody += '<tr><td>Sails</td><td>' + Math.floor(player.sails * 100) + '/100%</td></tr>';
            tableBody += '<tr><td>Heading</td><td>' + util.degreesToCardinal(player.position.d) + '</td></tr>';
            tableBody += '<tr><td>Velocity</td><td>' + Math.floor(player.velocity / 0.025722 * 100) / 100 + ' knots</td></tr>';
            tableBody += '<tr><td>Anchor</td><td>' + (player.anchor ? 'dropped' : 'weighed') + '</td></tr>';
        }
        if (fpsBody.html() !== tableBody)
            fpsBody.html(tableBody);
    }
    exports.updateTimes = updateTimes;
});
//# sourceMappingURL=ui.js.map