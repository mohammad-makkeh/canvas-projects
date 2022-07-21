import { OrbitControls } from "./lib/three/OrbitControls.js"
import * as Dat from "./lib/dat/dat.gui.module.js"
//Set up
		const gui = new Dat.GUI();
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x050901);
		const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 100000 );
		const renderer = new THREE.WebGLRenderer({antialias:true});
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );
		const controls = new OrbitControls( camera, renderer.domElement );
		controls.update();
		
		camera.position.set(0,10000,18000);
		camera.lookAt(0,0,0);

		const loader = new THREE.TextureLoader();
		
	//adding an xAxis
		const xAxisPoints = [];
		xAxisPoints.push( new THREE.Vector3( -20000 , 0 , 0 ) );
		xAxisPoints.push( new THREE.Vector3( +20000 , 0, 0 ) );
		const xAxis = new THREE.Line( 
			new THREE.BufferGeometry().setFromPoints( xAxisPoints ), 
			new THREE.LineBasicMaterial( { color: 0xffffff } )
		);
		//scene.add(xAxis);

	//adding a yAxis
		const yAxisPoints = [];
		yAxisPoints.push( new THREE.Vector3( 0 , -20000 , 0 ) );
		yAxisPoints.push( new THREE.Vector3( 0 , +20000, 0 ) );
		const yAxis = new THREE.Line( 
			new THREE.BufferGeometry().setFromPoints( yAxisPoints ), 
			new THREE.LineBasicMaterial( { color: 0xffffff } )
		);
		//scene.add(yAxis);


	//adding light
		//you have the sun! why would you need any lighting!!!
		//just kidding the lighting is added to the sun when it's created down
		//to add the effect of its glow
		

	//resizing canvas on resize

		function setSize(){
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setPixelRatio(window.devicePixelRatio);
		}
		window.addEventListener("resize", setSize);

	//getting the time
		let time = Date.now();

	//setting up the RayCaster and normalizinf mouse coordinates
		const ray = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		window.addEventListener("mousemove",(event)=>{
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1; 
			mouse.y = - (event.clientY / window.innerHeight) * 2 +	 1; 
		})

/////////////////////////////////////////Set up Done//////////////////////////////////////////////

	//setting dat.gui interface
		let pn = {
			'Planet to follow': "none"
		};
		let planetNames = ["sun", "mercury", "venus", "earth","mars", "jupiter", "saturn", "uranus","neptune", "none"];
		gui.add(pn, "Planet to follow", planetNames);




	//functions

		function getPlanetData(x, y, z, size, name, rotationRate, orbitRate){
			return {
				x: x,
				y: y,
				z: z,
				size: size,
				name: name,
				texture: loader.load(`./planets/${name}.jpg`),
				rotationRate: rotationRate,
				orbitRate: orbitRate,
			}
		}

		function getPlanet(planetData, toBeAdded){
			let planetGeo = new THREE.SphereGeometry(planetData.size, planetData.size, 32, 32);
			let material = new THREE.MeshStandardMaterial({
				map : planetData.texture,
			});

			let planet = new THREE.Mesh(planetGeo, material);
			
			planet.position.x = planetData.x;
			planet.position.y = planetData.y;
			planet.position.z = planetData.z;
			planet.castShadow = true;
			planet.recieveShadow = true;
			planet.data = planetData;
			planet.name = planetData.name;
			planets.push(planet);
			if(toBeAdded) scene.add(planet);
			return planet;
		}

		function movePlanet(planet){
			planet.rotation.y += planet.data.rotationRate;
			if(planet.data.orbitRate){
				planet.position.x = Math.cos( time * (1 / (planet.data.orbitRate * 1000) ) )
									* planet.data.x;

				planet.position.z = Math.sin( time * (1 / (planet.data.orbitRate * 1000) ) )
									* planet.data.x;
			}
		}

		function CreateOrbit(planet){
			let orbit=new THREE.Mesh(
									new THREE.RingGeometry(planet.data.x, planet.data.x + 10, 150),
									new THREE.MeshStandardMaterial({color:0xffffff, side:THREE.DoubleSide})
								);
			orbit.rotation.x = Math.PI / 2;
			scene.add(orbit);
			return orbit;
		}
		function followPlanet(planetName){
			if(planetName=="sun"){
				camera.position.set(0,1000,sun.data.size + 2500)
				camera.lookAt(0,0,0);
				return;
			}

			//get the planet

			let myPlanet = sun;
			planets.forEach( p => {
				myPlanet = ( p.name == planetName ) ? p : myPlanet;
			} );
			
			//follow myPlanet

			let distance = myPlanet.data.x + myPlanet.data.size;
			distance = distance < 6000 ? distance + 2000 : distance;
			let cx = Math.cos( time * (1 / (myPlanet.data.orbitRate * 1000) ) );
			let cy = cx;
			let cz = Math.sin( time * (1 / (myPlanet.data.orbitRate * 1000) ) );
			if(cx < 0 || cz < 0) distance = -distance;
			console.log(distance)


			camera.position.set(cx * ( myPlanet.position.x + myPlanet.data.size )  + distance,
								cz * ( myPlanet.position.z + myPlanet.data.size ) + distance ,
								cz * ( myPlanet.position.z + myPlanet.data.size ) + distance 
								);
			camera.lookAt(myPlanet.position.x,myPlanet.position.y,myPlanet.position.z);
		}
		function isFollowing(){
			return pn['Planet to follow'] != "none";
		}

		function moveMoon(moon, pivotPlanet, tilt){
			moon.rotation.y += moon.data.rotationRate;
			if(moon.data.orbitRate){
				moon.position.x = Math.cos( time * (1 / (moon.data.orbitRate * 1000) ) )
									* moon.data.x;

				moon.position.z = Math.sin( time * (1 / (moon.data.orbitRate * 1000) ) )
									* moon.data.x;

				moon.position.y = Math.sin( time * (1 / (moon.data.orbitRate * 1000) ) )
									* tilt;

				moon.position.x += pivotPlanet.position.x;
				moon.position.z += pivotPlanet.position.z;
			}
		}



	//adding all planets

		let planets = [];

		//special treatment for the sun, please
		let sunData = getPlanetData(0,0,0,4000,"sun", 0.001, 0);
		let sun = getPlanet(sunData, true);
		sun.material.displacementMap = loader.load(`./planets/displacementMaps/sunBW.jpg`);
		sun.material.displacementScale = 10;
		//light it up!
		let sunLight = new THREE.PointLight(0xffffff, 1.8, 100000);
		const ambientLight = new THREE.AmbientLight(0x999999, 1);
		sun.material.emissive = { r:255, g:255, b:255 };
		sun.material.emissiveMap = sunData.texture;
		sun.material.emissiveIntensity = 0.008;
		sun.add(sunLight, ambientLight)
		//create the glow
		const glow = new THREE.Sprite( new THREE.SpriteMaterial({
			map: loader.load('./glow.png'),
			color: 0xffae42,
			transparent: true,
			blending: THREE.AdditiveBlending
		}) );
		glow.scale.set(22000,15000,15000);
		sun.add(glow);



		let mercuryData = getPlanetData(sunData.size + 800, 0, 0, 100, "mercury", 0.001, 2);
		let mercury = getPlanet(mercuryData, true);
		CreateOrbit(mercury);

		let venusData = getPlanetData(sunData.size + 800 + 800, 0, 0, 300, "venus", 0.006, 5);
		let venus = getPlanet(venusData, true);
		CreateOrbit(venus);

		let earthData = getPlanetData(sunData.size + 1600 + 800, 0, 0, 300, "earth", 0.011, 7);
		let earth = getPlanet(earthData, true);
		CreateOrbit(earth);


		let marsData = getPlanetData(sunData.size + 2400 + 800, 0, 0, 150, "mars", 0.016, 11);
		let mars = getPlanet(marsData, true)
		CreateOrbit(mars);


		let jupiterData = getPlanetData(sunData.size + 3200 + 1600, 0, 0, 1000, "jupiter", 0.021, 14);
		let jupiter = getPlanet(jupiterData, true)
		CreateOrbit(jupiter);

		let saturnData = getPlanetData(sunData.size + 4800 + 2500, 0, 0, 700, "saturn", 0.026, 19);
		let saturn = getPlanet(saturnData, true)
		CreateOrbit(saturn);

		let uranusData = getPlanetData(sunData.size + 7300 + 2500, 0, 0, 500, "uranus", 0.031, 22);
		let uranus = getPlanet(uranusData, true)
		CreateOrbit(uranus);

		let neptuneData = getPlanetData(sunData.size + 9800 + 2500, 0, 0, 500, "neptune", 0.036, 26);
		let neptune = getPlanet(neptuneData, true)
		CreateOrbit(neptune);


	//adding the moons and saturn's ring

		//the ring:

		let saturnRing=new THREE.Mesh(
									new THREE.RingGeometry(saturn.data.size + 300, saturn.data.size + 600, 150),
									new THREE.MeshStandardMaterial({
										map: loader.load("./planets/saturnRing.png") ,
										side:THREE.DoubleSide
									})
								);
		saturnRing.position.set(saturn.position.x,saturn.position.y,saturn.position.z);
		saturnRing.rotation.x = 1.2;
		scene.add(saturnRing);


		//the moons:

		let moonData = getPlanetData(earth.data.size + 150, 0, 0, 50, "moon", 0.011, 1.2);
		let moon = getPlanet(moonData, true);

		let phobosData = getPlanetData(mars.data.size + 30, 0, 0, 20, "phobos", 0.016, 2);
		let phobos = getPlanet(phobosData, true);

		let deimosData = getPlanetData(mars.data.size + 110, 0, 0, 20, "deimos", 0.016, 1.7);
		let deimos = getPlanet(deimosData, true);
		deimos.material.displacementMap = loader.load(`./planets/displacementMaps/deimosBW.jpg`);
		deimos.material.displacementScale = 3;

		let ioData = getPlanetData(jupiter.data.size + 350, 0, 0, 150, "io", 0.016, 1);
		let io = getPlanet(ioData, true);

		let callistoData = getPlanetData(jupiter.data.size + 280, 0, 0, 100, "callisto", 0.016, 2);
		let callisto = getPlanet(callistoData, true);

		let cylleneData = getPlanetData(jupiter.data.size + 200, 0, 0, 100, "cyllene", 0.016, 3);
		let cyllene = getPlanet(cylleneData, true);

		let titanData = getPlanetData(saturn.data.size + 180, 0, 0, 80, "titan", 0.08, .8);
		let titan = getPlanet(titanData, true);

		let mirandaData = getPlanetData(uranus.data.size + 80, 0, 0, 50, "miranda", 0.016, .6);
		let miranda = getPlanet(mirandaData, true);
		miranda.material.displacementMap = loader.load(`./planets/displacementMaps/deimosBW.jpg`);
		miranda.material.displacementScale = 3;





		
		



		

//rendering and animating:

		let hoveredPLanet;
		let noise = 2;
		let following = false;
		let clicked = false;
		let intersects = ray.intersectObjects([...planets]);
		function animate(){
			let m = requestAnimationFrame(animate);
			time = Date.now();
			sun.material.displacementScale += noise;
			noise = (sun.material.displacementScale >= 120 || sun.material.displacementScale < 10) ? -noise : noise;
			
			movePlanet(sun);
			movePlanet(mercury);
			movePlanet(venus);
			movePlanet(earth);
			movePlanet(mars)
			movePlanet(jupiter);
			movePlanet(saturn);
			saturnRing.position.set(saturn.position.x,saturn.position.y,saturn.position.z);
			movePlanet(uranus);
			movePlanet(neptune);



			moveMoon(moon, earth, 100);
			moveMoon(phobos, mars, 150);
			moveMoon(deimos, mars, 0);
			moveMoon(io, jupiter, 700);
			moveMoon(callisto, jupiter, 200);
			moveMoon(cyllene, jupiter, 1200);
			moveMoon(titan, saturn, 1200);
			moveMoon(miranda, uranus, 200);

			if(isFollowing()) followPlanet(pn['Planet to follow']);
			
			ray.setFromCamera( mouse, camera );
		 	intersects = ray.intersectObjects([...planets]);
			
			if(intersects.length > 0){

				if(hoveredPLanet != intersects[0].object){
					if(hoveredPLanet){
						hoveredPLanet.scale.set(1,1,1);
						if(hoveredPLanet.name=="saturn")
							saturnRing.scale.set(1,1,1);
					}
					hoveredPLanet = intersects[0].object;
					if(hoveredPLanet!=sun)
						hoveredPLanet.scale.set(1.18,1.18,1.18);
					if(hoveredPLanet.name=="saturn"){
						saturnRing.scale.set(1.18,1.18,1.18);
					}
					
				}	
			}
			else{
				if(hoveredPLanet){
					hoveredPLanet.scale.set(1,1,1);
					if(hoveredPLanet.name=="saturn")
						saturnRing.scale.set(1,1,1);
					hoveredPLanet = undefined;
				}
					
			}
			
			renderer.render(scene, camera);
		} animate();



		window.addEventListener("mousedown", (event)=>{
			clicked = true;
			if(intersects.length)
				console.log(intersects[0].object.name);	

		})

		window.addEventListener("mouseup",()=>{
			clicked = false;	
		})






