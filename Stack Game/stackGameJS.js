"use strict"

let canvas;
const originalBoxWidth = 1.7;
const originalBoxDepth = 1.7;
let world, scene, camera, renderer, stack = [], overhangs = [], speed = 0.1, boxHeight = .5;
let gameStarted = false, xTurn = true;
let startingPos = 1;
const music = new Audio("./backgroundMusic.mp3");

function init(){

	//cannonjs

	world = new CANNON.World();
	world.gravity.set(0, -10, 0);
	world.broadphase = new CANNON.NaiveBroadphase();
	world.solver.iterations = 40;



	//threejs

	scene = new THREE.Scene();

	//camera
	const aspect = window.innerWidth / window.innerHeight;
	const width = 10;
	const height = width / aspect;

	camera = new THREE.OrthographicCamera( width/-2, width/2, height/2, height/-2 );
	camera.position.set(4, 4, 4);
	camera.lookAt(0, 0, 0);

	//renderer
	renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
	renderer.setClearColor(0x00000000, 0);
	renderer.setSize(innerWidth, innerHeight);
	renderer.render(scene, camera);
	document.body.appendChild(renderer.domElement);

	//get the canvas to change the background dynamically later
	canvas = document.querySelector("canvas");

	//lights
	const ambient = new THREE.AmbientLight(0xffffff, .3);
	const directional = new THREE.DirectionalLight(0xffffff, 1);
	directional.position.set(10, 20, 0);
	scene.add(ambient, directional);

	addGroundPlane();
	addFoundationBox();
	renderer.render(scene, camera);
}

init();





function addGroundPlane(){
	const plane = new THREE.Mesh(
								new THREE.PlaneGeometry(8, 8),
								new THREE.MeshLambertMaterial({color:"hsl(15, 100%, 50%)", side: THREE.DoubleSide})
							);
	plane.position.set(0, -10, 0);
	plane.rotation.x = Math.PI / 2;
	scene.add(plane);

	//cannon
	const shape = new CANNON.Box(new CANNON.Vec3(4, .001, 4));
	const mass = 0;
	const body = new CANNON.Body({mass, shape});
	body.position.set(0, -10, 0);
	world.addBody(body);
}


function addFoundationBox(){
	addLayer(0, 0, originalBoxWidth, originalBoxDepth, "x");
}


function addLayer(x, z, width, depth, direction){
	const y = boxHeight * stack.length - startingPos;
	const box = generateBox(x, y, z, width, depth);
	box.direction = direction;
	scene.add(box.threeMesh);
	stack.push(box);
	xTurn = !xTurn;
}

function addOverhang(x, z, width, depth){
	const y = boxHeight * (stack.length - 1) - startingPos;
	const box = generateBox(x, y, z, width, depth, 1);
	scene.add(box.threeMesh);
	overhangs.push(box);
}

function generateBox(x, y, z, width, depth, itsAnOverhang = 0){

	const boxGeo = new THREE.BoxGeometry(width, boxHeight, depth);
	const boxMat = new THREE.MeshLambertMaterial();
	boxMat.color = new THREE.Color(`hsl(${(stack.length - itsAnOverhang)*3.5 + 70}, 100%, 50%)`);
	const box = new THREE.Mesh( boxGeo, boxMat );
	box.position.set(x, y, z);


	//cannonjs
	const shape = new CANNON.Box( new CANNON.Vec3(width/2, boxHeight/2, depth/2));
	const mass = itsAnOverhang == 1 ? 5 : 0;
	const body = new CANNON.Body({mass, shape});
	body.position.set(x, y, z);
	world.addBody(body);


	return {
		cannonBody : body,
		threeMesh : box,
		width : width,
		depth : depth, 
	}
}

function handleClick(){

	if(gameover) return;

	if(!gameStarted){
		addLayer(0, -10, originalBoxWidth, originalBoxDepth, "z");
		animate();
		gameStarted = true;
		playMusic();
	}
	else{
		const topLayer = stack[stack.length-1];
		const previousLayer = stack[stack.length-2];
		const direction = topLayer.direction;
		let delta = topLayer.threeMesh.position[direction] - previousLayer.threeMesh.position[direction];
		let overhang = Math.abs(delta);
		if(overhang < 0.1){
			topLayer.threeMesh.position.x = previousLayer.threeMesh.position.x;
			topLayer.threeMesh.position.z = previousLayer.threeMesh.position.z;
			overhang = 0;
			delta = 0;
		}
		const size = direction == "x" ? topLayer.width : topLayer.depth;
		const overlap = size - overhang;
		if(overlap > 0){
			const newWidth = direction=="x" ? overlap : topLayer.width;
			const newDepth = direction=="z" ? overlap : topLayer.depth;
			topLayer.width = newWidth;
			topLayer.depth = newDepth;

			topLayer.threeMesh.scale[direction] = overlap / size;
			topLayer.threeMesh.position[direction] -= delta/2;

			//cannon
			topLayer.cannonBody.position[direction] -= delta/2;
				//there is no scaling in cannon, so replace the shape with one with the new dimensions
			const shape = new CANNON.Box( new CANNON.Vec3(newWidth/2, boxHeight/2, newDepth/2) );
			topLayer.cannonBody.shapes = [];
			topLayer.cannonBody.addShape(shape);

			//overhang piece
			const overhangShift = (overlap/2 + overhang/2) * Math.sign(delta);
			const overhangX = 
				direction == "x"
				? topLayer.threeMesh.position.x + overhangShift
				: topLayer.threeMesh.position.x;

			const overhangZ = 
				direction == "z"
				? topLayer.threeMesh.position.z + overhangShift
				: topLayer.threeMesh.position.z;

			const overhangWidth = direction == "x" ? overhang : newWidth;
			const overhangDepth = direction == "z" ? overhang : newDepth;
			addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth);


			addLayer(xTurn?-10:topLayer.threeMesh.position.x, xTurn?topLayer.threeMesh.position.z:-10, newWidth, newDepth, xTurn?"x":"z");	
		}
		else{
			scene.remove(topLayer.threeMesh);
			stack.pop(topLayer);
			addOverhang(topLayer.threeMesh.position.x,
						topLayer.threeMesh.position.z,
						topLayer.width,
						topLayer.depth,
						1);
			overhangs[overhangs.length - 1].direction = direction;
			gameover = true;
		}

	}


}



function updateOverhangPhysics(){
	world.step(1/60);	//or use your refresh rate of raf;

	//copy coordinates from cannon to three js for the overhangs
	overhangs.forEach(overhang=>{
		overhang.threeMesh.position.copy(overhang.cannonBody.position);
		overhang.threeMesh.quaternion.copy(overhang.cannonBody.quaternion);
	});
}

let flp;
function followLastPiece(){
	let lastPiece = overhangs[overhangs.length - 1];
	let direction = lastPiece.direction;
	updateOverhangPhysics();
	if(camera.position.y >= -5){
		camera.position.y = lastPiece.threeMesh.position.y + 5;
	}
	if(lastPiece.threeMesh.position[direction] < -4){
		if(lastPiece.cannonBody.position.y < -20){
			cancelAnimationFrame(flp);
			timeToScroll = true;
			return;
		}
	}
	else if(lastPiece.cannonBody.position.y < -9.7){
		cancelAnimationFrame(flp);
		timeToScroll = true;
		return;
	}

	renderer.render(scene, camera);
	flp = requestAnimationFrame(followLastPiece);
}



let raf;
let gameover = false,
	timeToScroll = false;
let tower;

function animate(){

	if(gameover){
		tower = new THREE.Group();
		for(let i = 0 ; i < stack.length ; i++){
			tower.add(stack[i].threeMesh);
			if( i < overhangs.length - 1 && overhangs[i].threeMesh.position.y > -2){
				tower.add(overhangs[i].threeMesh);
			}
				
		}
		scene.add(tower);
		cancelAnimationFrame(raf)
		followLastPiece();
		return;
	}
	else{
		//box movement
		let topLayer = stack[stack.length-1];

		topLayer.threeMesh.position[topLayer.direction] += speed;
		topLayer.cannonBody.position[topLayer.direction] += speed;

		//camera movement
		if(camera.position.y < boxHeight*(stack.length+4)){
			canvas.style.background = `linear-gradient(to top, hsl(${stack.length*3.5 + 50}, 100%, 35%) , transparent 90%)`;
			camera.position.y += 0.005;
			if(music.volume+0.0008 <= 1)
				music.volume += 0.0008;
		}
	}


	updateOverhangPhysics();
	renderer.render(scene, camera);
	raf = requestAnimationFrame(animate);
};


function setSize(){
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
}

const scrollUnit = 4;
let counter = 0;
let scrollSpeed = 0.2;
const scrollFriction = 0.9;
let raf_down, raf_up;

function scrollDown(){
	counter += 0.1;
	if(counter >= scrollUnit || camera.position.y <= -5){
		return;
	}
	camera.position.y -= scrollSpeed;
	tower.rotation.y -= scrollSpeed * 0.7;	
	scrollSpeed *= scrollFriction;
	renderer.render(scene, camera);
	raf_down = requestAnimationFrame(scrollDown);
}

function scrollUp(){
	counter += 0.1;
	if(counter >= scrollUnit || camera.position.y >= stack.length*boxHeight + 4){
		return;
	}
	camera.position.y += scrollSpeed;
	tower.rotation.y += scrollSpeed * 0.7;
	scrollSpeed *= scrollFriction;
	renderer.render(scene, camera);
	raf_up = requestAnimationFrame(scrollUp);
}

function scroll(e){
	if(!gameover || !timeToScroll) return;

	if(e.wheelDeltaY < 0){
		cancelAnimationFrame(raf_up);
		counter = 0;
		scrollSpeed = 0.2;
		scrollDown();
	}
	else{
		cancelAnimationFrame(raf_down);
		counter = 0;
		scrollSpeed = 0.2;
		scrollUp();
	}
	canvas.style.background = `linear-gradient(to top, hsl(${camera.position.y*5 + 50}, 100%, 35%) , transparent 90%)`;
	
}

function playMusic(){
	music.currenTime = 0;
	music.volume = 0.1;
	music.play();
}

window.addEventListener("click", handleClick);
window.addEventListener("resize", setSize);
window.addEventListener("wheel", scroll);


/*
TODO

*do an effect when bullseye, maybe weld effect ot increase color bloompass

*add game logistics and controls

*when lost , dont stop animation, drop the last piece but stop executing any functions and offer scrolling to view and restart button

*inhance the scroll and the canvas background color after loosing, maybe make the tower rotate as you scroll
*/