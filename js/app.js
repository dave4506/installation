var Colors = {
	red:0xFD5959,
	white:0xFCFAEF,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0xE0FFF9,
};

Physijs.scripts.worker = '/js/physijs_worker.js';
Physijs.scripts.ammo = '/js/ammo.js';

var scene,renderer,camera,controls;

function createScene() {
	var HEIGHT = window.innerHeight;
	var WIDTH = window.innerWidth;
	scene = new Physijs.Scene;
	scene.fog = new THREE.Fog(Colors.blue, 100, 950);
	var aspectRatio = WIDTH / HEIGHT;
	var fieldOfView = 90;
	var nearPlane = 1;
	var farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
		);
	camera.position.x = 0;
	camera.position.z = 0;
	camera.position.y = 100;
	scene.add( camera );
	renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true
	});
	var element = renderer.domElement
	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMap.enabled = true;
	var container = document.getElementById('world');
	container.appendChild(element);
	window.addEventListener('resize', function(){handleWindowResize(renderer,camera)}, false);
	controls = new THREE.OrbitControls(camera, element);
	controls.target.set(
		camera.position.x + 0.15,
		camera.position.y,
		camera.position.z
	);
	controls.noPan = true;
	controls.noZoom = true;
	scene.setGravity(new THREE.Vector3( 0, -20, 0 ));
	function setOrientationControls(e) {
		if (!e.alpha) {
			return;
		}
		controls = new THREE.DeviceOrientationControls(camera, true);
		controls.connect();
		controls.update();
		element.addEventListener('click', fullscreen, false);
		window.removeEventListener('deviceorientation', setOrientationControls, true);
	}
	window.addEventListener('deviceorientation', setOrientationControls, true);
}

function handleWindowResize() {
	var HEIGHT = window.innerHeight;
	var WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

function createLights() {
	var hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	var shadowLight = new THREE.DirectionalLight(0xffffff, .9);
	shadowLight.position.set(150, 350, 350);
	shadowLight.castShadow = true;
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	scene.add(hemisphereLight);
	scene.add(shadowLight);
	return {hemisphereLight,shadowLight}
}

function loop() {
	var axisHelper = new THREE.AxisHelper(10);
	scene.add(axisHelper);
	scene.simulate();
	renderer.render(scene,camera);
	camera.updateProjectionMatrix();
	controls.update();
	requestAnimationFrame(loop);
}

Ground = function(){
	var geom = new THREE.PlaneGeometry(5000,5000,32);
	var mat = Physijs.createMaterial(new THREE.MeshPhongMaterial({
		color:Colors.red,
		transparent:true,
		opacity:.6,
		shading:THREE.FlatShading,
	}),0.9,0.2);
	this.mesh = new Physijs.PlaneMesh(geom, mat);
	this.mesh.rotation.x = -Math.PI / 2;
	this.mesh.receiveShadow = true;
	this.mesh.position.y = 0;
}

GroundRing = function(radius,center){
	var geom = new THREE.RingGeometry(radius,radius-2,20,1);
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.blue,
		transparent:true,
		opacity:.6,
		shading:THREE.FlatShading,
	});
	this.mesh = new THREE.Mesh(geom,mat);
	this.mesh.position.x = center.x;
	this.mesh.position.y = center.y;
	this.mesh.position.z = center.z;
	this.mesh.rotation.x = -Math.PI / 2;
}

function createGround(){
	var ground = new Ground();
	scene.add(ground.mesh);
	for(i = 1; i<21; i++){
		var ring = new GroundRing(i*100,{x:0,y:200,z:0});
		scene.add(ring.mesh);
	}
	return ground;
}

var Pile = function(count,scene,{x,y,z}){
	for(i = 0; i<count; i++){
		var mat = Physijs.createMaterial(new THREE.MeshPhongMaterial({
			color:Colors.blue,
			transparent:true,
			opacity:1.0,
			shading:THREE.FlatShading,
		}),0.8,0.8);
		var box = new Physijs.BoxMesh(
		  new THREE.CubeGeometry( 2, 2, 2 ),
		  mat
		);
		box.position.set(getRandomInt(-5,5)+x,getRandomInt(-5,5)+y,getRandomInt(-5,5)+z);
		scene.add(box);
	}
}

function createPiles(gData) {
	Object.keys(gData).reverse().map(function(g,i){
		var datas = gData[g];
		var angle = 0;
		var increment = (2*Math.PI)/datas.length;
		var radius = (i+1)*100;
		datas.map(function(d){
			var x = Math.floor(Math.sin(angle)*radius)
			var z = Math.floor(Math.cos(angle)*radius)
			console.log(x,z)
			var pile = new Pile(d.number_of_victim_fatalities,scene,{x,y:150,z});
			angle += increment
		})
	})
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.addEventListener('load', init, false);

function prepareData(DATA) {
	var groupedData = _.groupBy(DATA,function(d){return d.number_of_victim_fatalities})
	console.log(groupedData)
	return groupedData;
}

function init() {
	var gData = prepareData(DATA);
	createScene();
	createLights();
	createGround();
	createPiles(gData);
	requestAnimationFrame(loop);
}
