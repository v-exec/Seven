//----------------- File Constructor Setup

var getFileBlob = function (url, cb) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url);
	xhr.responseType = "blob";
	xhr.addEventListener('load', function() {
	    cb(xhr.response);
	});
	xhr.send();
};

var blobToFile = function (blob, name) {
	blob.lastModifiedDate = new Date();
	blob.name = name;
	return blob;
};

var getFileObject = function(filePathOrUrl, name, cb) {
	getFileBlob(filePathOrUrl, function (blob) {
		cb(blobToFile(blob, name));
	});
};

//----------------- Setup

//canvases and mouse coordinates
var canvas = document.getElementById('back');
var ctx = canvas.getContext('2d');

var pixels = document.getElementById('pixels');
var pix = pixels.getContext('2d');

var cursorX = canvas.width;
var cursorY = canvas.height;
var nCursorX = 0;
var nCursorY = 0;
var ease = 0.1;

//background dots parameters
var dotSpacing = 25;
var dotMovement = 20;
var dotSize = 0.5;
var dotR = 0;
var dotG = 0;
var dotB = 0;
var dotA = 1;

//image path and image data
var select;
var n, s, t, d, w, h;

//image and file reader
var reader = new FileReader();
var img = new Image();

//whether or not image is zoomed
var zooming = false;

//set up drop zone listeners
var dropZone = document.getElementById('drop');

//get command line arguments
var remote = require('electron').remote;
var args = remote.getGlobal('arguments').arg;

//directory contents
var directory;
var images;

//set UI to invisible until load
document.getElementById('center').setAttribute("style", "display: none;");

//----------------- Listeners

//drop zone listeners
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);

//run setup on DOM load
window.addEventListener("DOMContentLoaded", function () {
    setup();
});

//----------------- Functions

//fit canvas to its container
function fitToContainer() {
	canvas.style.width = '100%';
	canvas.style.height = '100%';
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
}

//random int in range
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

//loads image data and gets image paths in image directory
function loadImage() {
	var dirs = args[1].split("\\");
	var name = dirs[dirs.length-1];

	getFileObject(args[1], name, function (fileObject) {
		readImage(fileObject);
	});

	directory = dirs[0];
	for (var i = 1; i < dirs.length; i++) {
		if (i < dirs.length-1) directory += dirs[i] + "\\";
		else {
			directory += dirs[i];
		}
	}

	remote.getGlobal('reset').r = false;
}

//gets image and data to html elements
function data() {
	//sets image in html
	document.getElementById('frame').setAttribute("style", "background-image: url("+ select +"); width: " + (w / h).toFixed(2) * 420 + "px;");
	document.getElementById('center').setAttribute("style", "width: " + ((w / h).toFixed(2) * 420 + 250)*1 + "px; margin-left: " + ((w / h).toFixed(2) * 420 + 250)/2*-1 + "px;");
	
	//posts dimensions
	if (w != null && h != null && w != 0 && h != 0) {
		document.getElementById('dimensions').innerHTML = "Dimensions: " + w + " x " + h;
		document.getElementById('ratio').innerHTML = "Aspect Ratio: " + (w / h).toFixed(2);
		document.getElementById('width').innerHTML = "Width: " + w + " pixels";
		document.getElementById('height').innerHTML = "Height: " + h + " pixels";
	}

	//posts file data
	if (n != null) document.getElementById('name').innerHTML = n;
	if (t != null) document.getElementById('type').innerHTML = "Filetype: " + t;
	if (d != null) document.getElementById('date').innerHTML = "Last Modified: " + d;
	if (s != null) document.getElementById('size').innerHTML = "Size: " + s + " bytes";
}

//scans through image and gets 4 random colors in each quarter, and one in the middle, through pixel scanning, sets them to html elements
function color(image) {
	var colors = new Array(5);

	pixels.width = image.width;
	pixels.height = image.height;
	pix.drawImage(image, 0, 0, img.width, img.height);
	colors[0] = pix.getImageData(getRandomInt(0, pixels.width/2), getRandomInt(0, pixels.height/2), 1, 1).data;
	colors[1] = pix.getImageData(getRandomInt(pixels.width/2, pixels.width), getRandomInt(0, pixels.height/2), 1, 1).data;
	colors[2] = pix.getImageData(getRandomInt(0, pixels.width/2), getRandomInt(pixels.height/2, pixels.height), 1, 1).data;
	colors[3] = pix.getImageData(getRandomInt(pixels.width/2, pixels.width), getRandomInt(pixels.height/2, pixels.height), 1, 1).data;
	colors[4] = pix.getImageData(pixels.width/2 + getRandomInt(-10, 10), pixels.height/2 + getRandomInt(-10, 10), 1, 1).data;
	colors.sort(compareColors);

	for (var i = 0; i < 5; i++) {
		document.getElementById('tone' + (i + 1)).setAttribute("style", "background-color: " + "rgba(" + colors[i][0] + ", " +  colors[i][1] + ", " + colors[i][2] + ", 1);")
	}
}

//used to sort colors by brightness
function compareColors(a, b) {
	var aa = (a[0] + a[1] + a[2]) / 3;
	var ab = (b[0] + b[1] + b[2]) / 3;
	return aa - ab;
}

//zoom into image
function zoom() {
	if (img.width != 0) {
		if (!zooming) {
			if (img.width > canvas.width || img.height > canvas.height) {
				document.getElementById('frame').setAttribute("style", "background-image: url("+ select +"); width: 100%; height: 100%;");
				if (img.width - canvas.width > img.height - canvas.height) document.getElementById('center').setAttribute("style", "width: "+canvas.width+"px; height:"+ canvas.width / (w/h).toFixed(2) +"px; margin-left: -"+canvas.width/2+"px; margin-top: -"+ (canvas.width / (w/h).toFixed(2))/2+"px;");
				else document.getElementById('center').setAttribute("style", "width: "+canvas.height * (w/h).toFixed(2)+"px; height:"+canvas.height+"px; margin-left: -"+canvas.height * (w/h).toFixed(2)/2+"px; margin-top: -"+canvas.height/2+"px;");
			} else {
				document.getElementById('frame').setAttribute("style", "background-image: url("+ select +"); width: 100%; height: 100%;");
				document.getElementById('center').setAttribute("style", "width: "+img.width+"px; height:"+img.height+"px; margin-left: -"+img.width/2+"px; margin-top: -"+img.height/2+"px;");
			}
			document.getElementById('data').setAttribute("style", "display: none;");
			zooming = true;

		} else {
			document.getElementById('frame').setAttribute("style", "background-image: url("+ select +"); width: " + (w / h).toFixed(2) * 420 + "px;");
			document.getElementById('center').setAttribute("style", "width: " + ((w / h).toFixed(2) * 420 + 250)*1 + "px; margin-left: " + ((w / h).toFixed(2) * 420 + 250)/2*-1 + "px;");
			document.getElementById('data').setAttribute("style", "");
			zooming = false;
		}
	}
}

//draws dot
function drawDot(x, y) {
	ctx.beginPath();
	ctx.arc(x, y, dotSize, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.fillStyle = "rgba("+dotR+", "+dotG+", "+dotB+", "+dotA+")";
	ctx.fill();
}

//drop handler
function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	var file = evt.dataTransfer.files[0];
	readImage(file);
}

//drag handler
function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
}

//read file and parse its data
function readImage(file) {
	reader.readAsDataURL(file);

	reader.onload = function(e) {
		select = e.target.result;

		n = file.name;
		s = file.size;
		t = file.type;
		d = file.lastModifiedDate.toLocaleDateString();

		img.src = select;
		
		img.onload = function() {
			w = img.width;
			h = img.height;
			data();
			color(img);
		}
	}
}

//----------------- Runtime

//animation setup
function setup() {
	fitToContainer();
	window.requestAnimationFrame(draw);
}

//animation loop
function draw() {
	fitToContainer();
	document.onmousemove = function (event) {
		cursorX = event.pageX;
		cursorY = event.pageY;
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//ease dots
	var dx = cursorX - nCursorX;
	nCursorX += dx * ease;

	var dy = cursorY - nCursorY;
	nCursorY += dy * ease;

	//draw dots
	for (var i = -dotSpacing; i <= canvas.width + dotSpacing * 2; i += dotSpacing) {
		for (var j = -dotSpacing; j <= canvas.height + dotSpacing * 2; j += dotSpacing) {
			drawDot(i - (nCursorX / canvas.width) * dotMovement, j - (nCursorY / canvas.height) * dotMovement);
		}
	}

	//loads image, if new image
	args = remote.getGlobal('arguments').arg;
	if (args.length > 1 && remote.getGlobal('reset').r) loadImage();

	window.requestAnimationFrame(draw);
}