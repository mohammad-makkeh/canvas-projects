import {Particle, particles, Segment, segments} from './physics.js'


const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export const c = canvas.getContext('2d');

const cx = canvas.width/2;
const cy = canvas.height/2;



let head = new Particle(cx, cy - 100, true);
let stomach = new Particle(cx, cy);
let _3ayb = new Particle(cx, cy + 160);

let leftHand = new Particle(cx - 100, cy + 30)
let rightHand = new Particle(cx + 100, cy + 30)

let leftLeg = new Particle(cx - 100, cy + 220)
let rightLeg = new Particle(cx + 100, cy + 220)



new Segment(head, stomach);
new Segment(_3ayb, stomach);

new Segment(leftHand, stomach);
new Segment(rightHand, stomach);

new Segment(leftLeg, _3ayb);
new Segment(rightLeg, _3ayb);



function animate(){
	c.clearRect(0, 0, canvas.width, canvas.height);
	segments.forEach(s=>s.update());
	particles.forEach(p=>p.update());
	requestAnimationFrame(animate);
}
// animate();


window.addEventListener('click', animate);

//test listeners

let v = {
	x: 0,
	y: 0
}




window.addEventListener('keydown', move);

window.addEventListener('keyup', e=>{
	keys[e.keyCode] = false;

})


let keys = [];
let speed = 12;

function move(e){
	keys[e.keyCode] = true;
	
	if (keys[38] ) {
        head.loc[1] -= speed;
    }   
    if (keys[40] ) {
        head.loc[1] += speed;
    }
    if (keys[39]  ) {
        head.loc[0] += speed;
    }
    if (keys[37] ) {
        head.loc[0] -= speed;
    }
}


/*
TODO

*code to remove a segment when you press on it
*code to send a wave of air (force) in a particular direction to simulate cloth

*/