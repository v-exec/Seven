const canvas = document.getElementById('back');
const ctx = canvas.getContext('2d');

const pixels = document.getElementById('pixels');
const pix = pixels.getContext('2d');

const dataSpaceWidth = 250;
const totalHeightSpace = 420;

let cursorX = canvas.width;
let cursorY = canvas.height;
let nCursorX = 0;
let nCursorY = 0;
const ease = 0.1;

//background dots
const dotSpacing = 25;
const dotMovement = 20;
const dotSize = 0.5;
let dotR = 0;
let dotG = 0;
let dotB = 0;
let dotA = 1;
let dark = false;
const switcher = document.getElementById('switcher');

//image path and data
let select;
let n, s, t, d, w, h;

//file reader and image
const reader = new FileReader();
const img = new Image();

const dropZone = document.getElementById('drop');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);
switcher.addEventListener('click', handleDarkSwitch, false);

window.addEventListener("DOMContentLoaded", function () {
	setup();
});

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

//image and data to html
function data() {
	var aspectRatio = (w / h).toFixed(2);

	document.getElementById('frame').setAttribute("style", "background-image: url("+ select +"); width: " + aspectRatio * totalHeightSpace + "px;");
	document.getElementById('center').setAttribute("style", "width: " + (aspectRatio * totalHeightSpace + dataSpaceWidth) + "px;");
	
	if (w != null && h != null && w != 0 && h != 0) {
		document.getElementById('dimensions').innerHTML = "Dimensions: " + w + " x " + h;
		document.getElementById('ratio').innerHTML = "Aspect Ratio: " + (w / h).toFixed(2);
		document.getElementById('width').innerHTML = "Width: " + w + " pixels";
		document.getElementById('height').innerHTML = "Height: " + h + " pixels";
	}

	if (n != null) document.getElementById('name').innerHTML = n;
	if (t != null) document.getElementById('type').innerHTML = "Filetype: " + t;
	if (d != null) document.getElementById('date').innerHTML = "Last Modified: " + d;
	if (s != null) document.getElementById('size').innerHTML = "Size: " + s + " bytes";
}

//scans through image and gets 4 random colors in each quarter, and one in the middle, and sets them to html elements
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

function drawDot(x, y) {
	ctx.beginPath();
	ctx.arc(x, y, dotSize, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.fillStyle = "rgba("+dotR+", "+dotG+", "+dotB+", "+dotA+")";
	ctx.fill();
}

function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	var file = evt.dataTransfer.files[0];
	readImage(file);
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
}

function handleDarkSwitch() {
	var data = document.getElementsByClassName('datum');

	if (dark) {
		dotR = 0;
		dotG = 0;
		dotB = 0;
		dotA = 1;
		document.body.style.backgroundColor = "#eee";
		for (var i = 0; i < data.length; i++) {
			data[i].style.color = "#111";
		}
		switcher.src = "switch_dark.svg";

		dark = false;
	} else {
		dotR = 255;
		dotG = 255;
		dotB = 255;
		dotA = 1;
		document.body.style.backgroundColor = "#111";
		for (var i = 0; i < data.length; i++) {
			data[i].style.color = "#eee";
		}
		switcher.src = "switch_light.svg";

		dark = true;
	}
}

//read file and parse its data
function readImage(file) {
	reader.readAsDataURL(file);

	reader.onload = function(e) {
		select = e.target.result;

		n = file.name;
		s = file.size;
		t = file.type;
		d = new Date(file.lastModified).toLocaleDateString();

		img.src = select;
		
		img.onload = function() {
			w = img.width;
			h = img.height;
			data();
			color(img);
		}
	}
}

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

	window.requestAnimationFrame(draw);
}