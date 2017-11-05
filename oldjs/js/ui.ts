import util = require('util');
import $ = require('jquery');
declare var DEBUG:boolean;

export interface ViewPort {
	x:number,
	y:number,
	width:number,
	height:number,
	tileScale:number
}

var activeCanvas:any;
var bufferCanvas:any;
var context:any;
var buffer:any;
var scale:number;
var xOffset:number = 0;
var yOffset:number = 0;
var fpsBody:any;
var imageCache:HTMLImageElement[] = [];
var width:number;
var height:number;
var viewPort:ViewPort = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	tileScale: 64 // 100 meters = 1 tile = 64 pixels
};

export function init():void {
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
export function getWidth():number {
	if (!width)
		width = $('#game').width()
	return width;
}
export function getHeight():number {
	if (!height)
		height = $('#game').height()
	return height;
}
export function getViewPort():ViewPort {
	return viewPort;
}
export function centerViewPort(x:number, y:number, worldWidth:number, worldHeight:number):void {
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
export function isOnScreen(x:number, y:number, width:number, height:number):boolean {
	x *= viewPort.tileScale;
	y *= viewPort.tileScale;
	width *= viewPort.tileScale;
	height *= viewPort.tileScale;
	return x - Math.abs(xOffset) < (viewPort.x + viewPort.width)
			&& y - Math.abs(yOffset) < (viewPort.y + viewPort.height)
			&& x + xOffset + width > viewPort.x
			&& y + yOffset + height > viewPort.y
}
export function getVisibleTileArea():util.Area {
	var area:util.Area = {
		x: Math.floor((viewPort.x + xOffset) / viewPort.tileScale) - 1,
		y: Math.floor((viewPort.y + yOffset) / viewPort.tileScale) - 1,
		width: 0,
		height: 0
	};
	if (area.x < 0) area.x = 0;
	if (area.y < 0) area.y = 0;
	area.width = area.x + Math.ceil(viewPort.width / viewPort.tileScale) + 2;
	area.height = area.y + Math.ceil(viewPort.height / viewPort.tileScale) + 2;
	return area;
}
export function setOffset(x:number, y:number):void {
	xOffset = x;
	yOffset = y;
}
export function setAA(newValue:boolean):void {
	buffer.imageSmoothingEnabled = newValue;
}
export function drawRect(x:number, y:number, width:number, height:number, color:util.Color):void {
	buffer.beginPath();
	buffer.fillStyle = color.rgba;
	// Start with x,y on original canvas
	// Translate by the viewPort x,y
	// Scale to fill viewPort
	buffer.rect(x, y, width, height);
	buffer.fill();
	buffer.closePath();
}
export function drawRectRel(x:number, y:number, width:number, height:number, color:util.Color):void {
	if (!isOnScreen(x,y,width, height)) return;
	x *= viewPort.tileScale;
	y *= viewPort.tileScale;
	width *= viewPort.tileScale;
	height *= viewPort.tileScale;
	buffer.beginPath();
	buffer.fillStyle = color.rgba;
	// Start with x,y on original canvas
	// Translate by the viewPort x,y
	// Scale to fill viewPort
	buffer.rect(
			(x + xOffset - viewPort.x),
			(y + yOffset - viewPort.y),
			width,
			height);
	buffer.fill();
	buffer.closePath();
}
export function drawImageRel(x:number, y:number, width:number, height:number, url:string, degrees:number = 0, opacity:number = 1):void {
	drawSpriteRel(x, y, width, height, 0, 0, 0, 0, url, degrees, opacity);
}
export function drawSprite(x:number, y:number, width:number, height:number, dx:number, dy:number, dwidth:number, dheight:number, url:string, degrees:number = 0, opacity:number = 1):void {
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
export function drawSpriteRel(x:number, y:number, width:number, height:number, dx:number, dy:number, dwidth:number, dheight:number, url:string, degrees:number = 0, opacity:number = 1):void {
	if (!isOnScreen(x, y, width, height)) return;
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
		buffer.translate(x + (width/2) + xOffset - viewPort.x, y + (height/2) + yOffset - viewPort.y);
		buffer.rotate(Math.PI/180*degrees);
		if (dwidth == 0 && dheight == 0)
			buffer.drawImage(imageCache[url],
				-width/2,
				-height/2,
				width,
				height
			);
		else
			buffer.drawImage(imageCache[url],
				dx,
				dy,
				dwidth,
				dheight,
				-width/2,
				-height/2,
				width,
				height
			);
		buffer.restore();
	} else {
		if (dwidth == 0 && dheight == 0)
			buffer.drawImage(imageCache[url],
				(x + xOffset - viewPort.x),
				(y + yOffset - viewPort.y),
				width,
				height
			);
		else
			buffer.drawImage(imageCache[url],
				dx,
				dy,
				dwidth,
				dheight,
				(x + xOffset - viewPort.x),
				(y + yOffset - viewPort.y),
				width,
				height
			);
	}
	//buffer.scale(1/viewPort.tileScale,1/viewPort.tileScale);
	//buffer.setTransform(1,0,0,1,0,0); // Reset transformation matrix to identity
	buffer.globalAlpha = 1;
}
export function drawText(x:number, y:number, text:string, fontSize:number, color:util.Color, centered:boolean = false, fontName:string = 'Courier New'):void {
	if (DEBUG) drawRect(x, y, 5, 5, util.Color.red);
	buffer.beginPath();
	buffer.fillStyle = color.rgba;
	buffer.textAlign = centered ? 'center' : 'left';
	buffer.font = fontSize + 'px ' + fontName;
	buffer.fillText(text, x, y);
	buffer.closePath();
}
export function drawTextRel(x:number, y:number, text:string, fontSize:number, color:util.Color, centered = false, fontName:string = 'Courier New'):void {
	x *= viewPort.tileScale;
	y *= viewPort.tileScale;
	if (   x > (viewPort.x + viewPort.width)
			|| y > (viewPort.y + viewPort.height)
			|| x < viewPort.x
			|| y < viewPort.y) return; // Check if off-screen before drawing
	buffer.beginPath();
	buffer.fillStyle = color.rgba;
	buffer.textAlign = centered ? 'center' : 'left';
	buffer.font = Math.floor(fontSize * viewPort.tileScale) + 'px ' + fontName;
	buffer.fillText(text,
		x + xOffset - viewPort.x,
		y + yOffset - viewPort.y);
	buffer.closePath();
}
export function drawBuffer():void {
	context.drawImage(bufferCanvas[0],0,0);
}
export function updateTimes(debugStats:any, world:any) {
	var tableBody = '';
	var ec = world.getEntityCount();
	var player = world.getPlayer();
	tableBody += '<tr><th colspan=2>Debug Information</th></tr>';
	tableBody += '<tr><td>TPS</td><td>'+debugStats.getTPS().toFixed(0)+' fps</td></tr>';
	tableBody += '<tr><td>Delta</td><td>'+debugStats.getDelta()+'</td></tr>';
	tableBody += '<tr><td>Tick</td><td>'+debugStats.lastTwentyTickTimes[0]+' ms</td></tr>';
	tableBody += '<tr><td>Draw</td><td>'+debugStats.lastTwentyDrawTimes[0]+' ms</td></tr>';
	tableBody += '<tr><td>Entities</td><td>'+ec.current+'/'+ec.max+'</td></tr>';
	tableBody += '<tr><td>Wind</td><td>0 knots at NNE</td></tr>';
	if (player) {
		tableBody += '<tr><td>X</td><td>'+Math.floor(player.position.x)+'</td></tr>';
		tableBody += '<tr><td>Y</td><td>'+Math.floor(player.position.y)+'</td></tr>';
		tableBody += '<tr><td>Rudder</td><td>'+player.rudder+'/60 deg</td></tr>';
		tableBody += '<tr><td>Sails</td><td>'+Math.floor(player.sails*100)+'/100%</td></tr>';
		tableBody += '<tr><td>Heading</td><td>'+util.degreesToCardinal(player.position.d)+'</td></tr>';
		tableBody += '<tr><td>Velocity</td><td>'+Math.floor(player.velocity/0.025722*100)/100+' knots</td></tr>';
		tableBody += '<tr><td>Anchor</td><td>'+(player.anchor?'dropped':'weighed')+'</td></tr>';
	}
	if (fpsBody.html() !== tableBody) fpsBody.html(tableBody);
}