const canvas = document.querySelectorAll('canvas')[0];
const ctx = canvas.getContext('2d');
const canvas2 = document.querySelectorAll('canvas')[1];
const ctx2 = canvas2.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas2.width = window.innerWidth;
canvas2.height = window.innerHeight;
const width = canvas.width;
const height = canvas.height;
let circles = [];
const circleCount = width * height * 0.004;
const minimumSpacing = 0.5;

function xmur3(str) {
	let h = 1779033703 ^ str.length;

	for (let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
		h = h << 13 | h >>> 19;
	}

	return () => {
		h = Math.imul(h ^ h >>> 16, 2246822507);
		h = Math.imul(h ^ h >>> 13, 3266489909);

		return (h ^= h >>> 16) >>> 0;
	}
}

function mulberry32(a) {
	return () => {
		let t = a += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);

		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	}
}

function drawCircle(ctx, x = 0, y = 0, radius = 10, color = 'black', label) {
	ctx.beginPath();
	ctx.arc(x, y, Math.max(radius - minimumSpacing, 1), 0, Math.PI * 2, true);
	ctx.fillStyle = color;
	ctx.fill();

	if (label) {
		ctx.fillStyle = 'white';
		ctx.font = '30px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(label, x, y);
	}

	return {x, y, radius, color};
}

function distance(x0, y0, x1, y1) {
	return Math.sqrt(((x0 - x1) * (x0 - x1)) + ((y0 - y1) * (y0 - y1)));
}

function hitTest(x, y, radius) {
	for (let i = 0; i < circles.length; i++) {
		if (distance(x, y, circles[i].x, circles[i].y) < radius + circles[i].radius) {
			return true;
		}
	}

	return false;
}

function randomColor() {
	// const r = ('00' + (Math.random() * 255 >>> 0).toString(16)).substr(-2);
	// const g = ('00' + (Math.random() * 255 >>> 0).toString(16)).substr(-2);
	// const b = ('00' + (Math.random() * 255 >>> 0).toString(16)).substr(-2);

	const r = ('00' + (32 + (Math.random() * 64) >>> 0).toString(16)).substr(-2);
	const g = ('00' + (64 + (Math.random() * 127) >>> 0).toString(16)).substr(-2);
	const b = ('00' + (127 + (Math.random() * 64) >>> 0).toString(16)).substr(-2);

	return '#' + r + g + b;
}

function randomColor2() {
	const r = ('00' + (190 + (Math.random() * 64) >>> 0).toString(16)).substr(-2);

	return '#' + r + r + '00';
}

const seed = xmur3('seed');
// const random = mulberry32(seed());
const random = Math.random;

async function drawLogo() {
	const response = await fetch('logo.svg');
	let logo = await response.text();
	logo = (new window.DOMParser()).parseFromString(logo, 'text/xml');
	const svgCircles = logo.querySelectorAll('circle');
	const viewBox = logo.querySelector('svg').getAttribute('viewBox').split(' ');
	const svgWidth = parseFloat(viewBox[2]);
	const svgHeight = parseFloat(viewBox[3]);

	const scale = (width / svgWidth) * 0.9;
	let x = 0;
	let y = 0;
	let radius = parseFloat(svgCircles[0].getAttribute('r')) * scale;

	for (let i = 0; i < svgCircles.length; i++) {
		x = parseFloat(svgCircles[i].getAttribute('cx')) + ((width - (svgWidth * scale)) / (scale * 2));
		y = parseFloat(svgCircles[i].getAttribute('cy')) + ((height - (svgHeight * scale)) / (scale * 2));

		circles.push(drawCircle(ctx2, x * scale, y * scale, radius, randomColor2()));
	}
}

function drawCircles() {
	let x = 0;
	let y = 0;
	let radius = 100;
	let radiusVariation = 1;
	let color = '#000';

	for (let i = 0; i < circleCount; i++) {
		let tries = 0;
		color = randomColor();
		radiusVariation = (Math.random() + 1) * 2;

		do {
			x = random() * width;
			y = random() * height;
			tries++;

			if (tries > 10000) {
				radius = radius - 1;

				if (radius < 40) break;
			};
		} while (hitTest(x, y, radius * radiusVariation));
		
		if (tries < 10000) {
			circles.push(drawCircle(ctx, x, y, radius * radiusVariation, color));
		}
	}
}

async function main() {
	await drawLogo();
	drawCircles();
}

main();
