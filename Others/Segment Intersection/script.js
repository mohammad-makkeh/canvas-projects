"use strict"

const canvas = document.getElementById('canvas');
canvas.width = innerWidth;
canvas.height = innerHeight;

const c = canvas.getContext('2d')


const A = {x: 200, y: 150};
const B = {x: 150, y: 250};
const C = {x: 50, y: 100};
const D = {x: 250, y: 250};



let t = -.3;
function animate(){

	c.clearRect(0, 0, canvas.width, canvas.height);

	drawLine(A, B);
	drawLine(C, D);

	drawDot(A, 'A');
	drawDot(B, 'B');
	drawDot(C, 'C');
	drawDot(D, 'D');

	const M_AB = getPointAtPercentage(A, B, t);
	const M_CD = getPointAtPercentage(C, D, t);

	drawDot(M_AB, 'M', t>=0 && t<=1);
	drawDot(M_CD, 'N', t>=0 && t<=1);


	t += 0.005;
	requestAnimationFrame(animate)
}
animate();








function drawDot(point, label, isOnLine = true){
	c.beginPath();
	c.fillStyle = 	isOnLine ? 'white' : 'red';
	c.arc(point.x, point.y, 10, 0, Math.PI * 2);
	c.fill();
	c.stroke();

	c.fillStyle = 'black'
	c.textAlign='center';
	c.textBaseline='middle';
	c.font='bold 14px Arial';
	c.fillText(label, point.x, point.y);
	c.closePath();
}

function drawLine(from, to){
	c.beginPath();
	c.moveTo(from.x, from.y);
	c.lineTo(to.x, to.y);
	c.stroke();
}

function getMiddlePoint(from, to){
	return getPointAtPercentage(from, to, 0.5);
}


function getPointAtPercentage(from, to, t){
	return {
		x: lerp(from.x, to.x, t),
		y: lerp(from.y, to.y, t),
	}
}





function lerp(a, b, e){
	return a + (b - a) * e;
}

