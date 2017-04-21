//setup variables
var canvas = document.getElementById('back');
var ctx = canvas.getContext('2d');

var pixels = document.getElementById('pixels');
var pix = pixels.getContext('2d');

var cursorX = canvas.width;
var cursorY = canvas.height;

var spacing = 25;
var movement = 20;

var select;
var n, s, t, d, w, h;

var reader = new FileReader();
var img = new Image();

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

//gets image and data to html elements
function data() {
	//sets image in html
	document.getElementById('frame').setAttribute("style", "background-image: url("+ select +");");
	
	//posts dimensions
	if (w != null && h != null && w != 0 && h != 0){
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

//scans through image and gets 5 primary colors through pixel scanning, sets them to html elements
function color(image) {
	var colors = new Array(5);

	pixels.width = image.width;
	pixels.height = image.height;
	pix.drawImage(image, 0, 0, img.width, img.height);

	for (var i = 0; i < 4; i++) {
		colors[i] = pix.getImageData(getRandomInt(0, pixels.width), getRandomInt(0, pixels.height), 1, 1).data;
	}

	colors[4] = pix.getImageData(pixels.width/2 + getRandomInt(-10, 10), pixels.height/2 + getRandomInt(-10, 10), 1, 1).data;
	
	colors.sort(compareColors);

	for (var i = 0; i < 5; i++) {
		document.getElementById('tone' + (i + 1)).setAttribute("style", "background-color: " + "rgba(" + colors[i][0] + ", " +  colors[i][1] + ", " + colors[i][2] + ", 1);")
	}
}

function compareColors(a, b) {
	var aa = (a[0] + a[1] + a[2]) / 3;
	var ab = (b[0] + b[1] + b[2]) / 3;
	return aa - ab;
}

//draws dot
function drawDot(x, y) {
	var size = 0.5;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = "rgba(204, 204, 204, 0.7)";
    ctx.fill();
}

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

    //draw dots
    for (var i = -spacing; i <= canvas.width + spacing * 2; i += spacing) {
    	for (var j = -spacing; j <= canvas.height + spacing * 2; j += spacing) {
    		drawDot(i - (cursorX / canvas.width) * movement, j - (cursorY / canvas.height) * movement);
    	}
    }

    window.requestAnimationFrame(draw);
}

window.addEventListener("DOMContentLoaded", function () {
    setup();
});

//drop handler
function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	var file = evt.dataTransfer.files[0];
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

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
}

var dropZone = document.getElementById('drop');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);