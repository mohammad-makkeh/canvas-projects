import {c} from './index.js'
import * as physics from './utils.js'



export let particles = [];
export let segments = [];
const G = [0, .15];

export class Particle{
	constructor(x, y, isFixed = false){
		this.x = x;
		this.y = y;
		this.loc = [x, y];
		this.oldLoc = [x, y];
		this.isFixed = isFixed;
		particles.push(this);
		this.draw()
	}

	draw(){
		c.beginPath();
		c.fillStyle = this.isFixed ? 'red' : 'green'
		c.strokeStyle = "black"
		c.lineWidth = 1;
		c.arc(this.loc[0], this.loc[1], 15, 0, Math.PI*2)
		c.fill();
		c.stroke();
		c.closePath();
	}

	update(){
		if(this.isFixed) return this.draw();
		let vel = physics.subtract(this.loc, this.oldLoc);
		let newLoc = physics.add(this.loc, vel);
		newLoc = physics.add(newLoc, G);
		this.oldLoc = this.loc;	
		this.loc = newLoc;
		this.draw();
	}

}

export class Segment{
	constructor(p1, p2){
		this.p1 = p1;
		this.p2 = p2;
		this.length = physics.distance(p1.loc, p2.loc);
		segments.push(this);
		this.draw()
	}

	draw(){
		c.beginPath();
		c.moveTo(...this.p1.loc);
		c.lineTo(...this.p2.loc);
		c.stroke();
		c.closePath();
	}
	update(){
		const diffVec = physics.subtract(this.p1.loc, this.p2.loc);	//distance vector between the two points now
		const magn = physics.magnitude(diffVec);	//actual distance between the 2 points
		const diff = magn - this.length;	//the difference between what the distance is and what is should be(segment length)
		const norm = physics.normalize(diffVec);	//normalize the current distace vector between the 2 points

		//move the point into the other other point by half the distance between them
		if(!this.p1.isFixed) this.p1.loc = physics.add(this.p1.loc, physics.scale(norm, -diff/2));
		if(!this.p2.isFixed) this.p2.loc = physics.add(this.p2.loc, physics.scale(norm, diff/2));

		this.draw();
	}
}







