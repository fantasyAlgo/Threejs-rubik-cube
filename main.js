import * as THREE from 'three';
import { positionToIndex, rotationHandler, matmul2d, rotateXAxis, rotateYAxis, rotateZAxis, facingDirection } from './helpers.js';

const scene = new THREE.Scene();

let zDistance = 7;
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var raycaster = new THREE.Raycaster(); // create once
var mouse = new THREE.Vector2(); // create once

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let cubes = [];
let cubes2D = [];
const N = 9;
let directionFacing;

let mouseDown = false;

let pointingVector= [-1,-1,-1]; 
let move = "";
let mouseUpCoord = [0, 0];
const materials = [
	new THREE.MeshBasicMaterial({ color: 0xdad9d8, side: THREE.DoubleSide }), // Red
	new THREE.MeshBasicMaterial({ color: 0x0000cc, side: THREE.DoubleSide }), // Green
	new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }), // Blue
	new THREE.MeshBasicMaterial({ color: 0xff7800, side: THREE.DoubleSide }), // White
	new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }), // Yellow
	new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }), // Magenta
  ];

for (let i = 0; i < 3; i++) {
  cubes2D = [];
  for (let j = 0; j < N; j++) {
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const cube = new THREE.Mesh( geometry, materials );
	cube.name = "cube" + i + j;
    scene.add( cube );
    cubes2D.push(cube);
  }
  cubes.push(cubes2D);
}

let SC = 0;
let prevMouse = new THREE.Vector2();
prevMouse.x = mouse.x;
prevMouse.y = mouse.y
let rotX = 0;
let rotY = 0;
document.getElementById("PAW").addEventListener("click", scramble, false);

let visual = 0;
camera.position.x = zDistance*Math.cos(SC);
camera.position.z = zDistance*Math.sin(SC);
directionFacing = facingDirection(SC);

function scramble(){
	for (let i = 0; i < 10; i++) {
		let moves = ["U", "D", "R", "L"];
		move = moves[Math.floor(Math.random()*4)];
		directionFacing = Math.floor(Math.random()*4);
		makeMove([Math.floor(Math.random()*3), Math.floor(Math.random()*3), Math.floor(Math.random()*3)], Math.PI/2, true);
		move = "";
		pointingVector = [-1, -1, -1];
		moveRotation = -1;
	}
}

function makeRubixCube(){
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < N; j++) {
		  cubes[i][j].position.x = Math.floor(j/3)*1.2 -1.2;
		  cubes[i][j].position.y = (j%3)*1.2 - 1.2;	
		  cubes[i][j].position.z = i*1.2 - 1.2;
		}
	}
}
function circleSquare(cube, rot, mode = 0, indx = [0,0,0]){
	// Adjust the rotation little jerk (i'm trans and i can say that :D)
	//cube.rotation.reorder('XYZ');
	if (mode == 0){
		[cube.position.y, cube.position.z] = matmul2d(rotationHandler(rot), [cube.position.y, cube.position.z]);
		if (directionFacing == 0 || directionFacing == 2) rotateYAxis(cube, rot);
		else rotateXAxis(cube, rot);
	}
	else if (mode == 1){
		[cube.position.x, cube.position.z] = matmul2d(rotationHandler(rot), [cube.position.x, cube.position.z]);
		rotateYAxis(cube, -rot);
	}else{
		[cube.position.x, cube.position.y] = matmul2d(rotationHandler(rot), [cube.position.x, cube.position.y]);
		rotateZAxis(cube, rot);
	}
}

function rotateSlice(x, mod, rot, mode){
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (mod == 0) circleSquare(cubes[x][i*3 + j], rot, mode, [x,i*3 + j]);
			else if (mod == 1) circleSquare(cubes[i][x*3 + j], rot, mode, [i,x*3 + j]);
			else circleSquare(cubes[i][j*3 + x], rot, mode, [i,j*3 + x]);
		}
	}
}
function frontalIndx(){
	if (directionFacing == 0) return [[0, 2], [2, 1]];
	if (directionFacing == 1) return [[1, 0], [2, 1]];
	if (directionFacing == 2) return [[0, 2], [2, 1]];
	if (directionFacing == 3) return [[1, 0], [2, 1]];
	return [[-1, -1], [-1, -1]]
}

function applyRotations(){
	let indx;
	let cubeCopy = Array(3).fill(0).map(x => Array(9).fill(0));
	for (let i= 0; i < 3; i++) 
		for (let j = 0; j < 9; j++)
			cubeCopy[i][j] = cubes[i][j];

	for (let i= 0; i < 3; i++) {
		for (let j = 0; j < 9; j++){
			indx = positionToIndex(cubeCopy[i][j].position.x, cubeCopy[i][j].position.y, cubeCopy[i][j].position.z);
			cubes[indx[0]][indx[1]] = cubeCopy[i][j];
			cubes[indx[0]][indx[1]].name = "cube" + indx[0] + indx[1];
			cubes[indx[0]][indx[1]].position.x = Math.floor(indx[1]/3)*1.2 -1.2;
			cubes[indx[0]][indx[1]].position.y = (indx[1]%3)*1.2 - 1.2;
			cubes[indx[0]][indx[1]].position.z = indx[0]*1.2 - 1.2;
		}
	}
}

function makeMove(pointingVector, rot = Math.PI/2, finish = true){
	let indexes = frontalIndx();
	if (indexes[0][0] == -1) return;
	//console.log("move: ", move, " | ", indexes[0][0], " | ", indexes[0][1]);
	if (move == "U") rotateSlice(pointingVector[indexes[0][0]], indexes[0][0], directionFacing == 0 || directionFacing == 1 ? rot : -rot, indexes[0][1]);
	if (move == "D") rotateSlice(pointingVector[indexes[0][0]], indexes[0][0], directionFacing == 0 || directionFacing == 1 ? -rot : rot, indexes[0][1]);
	if (move == "R") rotateSlice(pointingVector[2], 2, -rot, 1);
	if (move == "L") rotateSlice(pointingVector[2], 2, rot, 1);
	if (finish) applyRotations();
}

let moveRotation = -1;
let velocity = (Math.PI/2)/50;
makeRubixCube();
function animate() {
	requestAnimationFrame( animate );
	raycaster.setFromCamera( mouse, camera );
	if (moveRotation != -1 && moveRotation < Math.PI/2){
		makeMove(pointingVector, velocity, false);
		moveRotation += velocity;
		camera.lookAt( 0, 0, 0 );
		renderer.render( scene, camera );
		return;
	}
	if (!(moveRotation <= Math.PI/2)){
		applyRotations();
		move = "";
		pointingVector = [-1, -1, -1];
		moveRotation = -1;
	}
	const intersects = raycaster.intersectObjects( scene.children );

	if (intersects.length > 0 && mouseDown && pointingVector[0] == -1)
	  pointingVector = [Number(intersects[0].object.name[4]), Math.floor(Number(intersects[0].object.name[5])/3), Number(intersects[0].object.name[5])%3];
	
	if (mouseDown && intersects.length == 0 && pointingVector[0] == -1 && visual == 0){
		rotX += (mouse.x-prevMouse.x);
		camera.position.x = zDistance*Math.cos(-rotX*10);
		camera.position.z = zDistance*Math.sin(-rotX*10);
		directionFacing = facingDirection(rotX*10);
	}
	if (mouseDown && intersects.length == 0 && pointingVector[0] == -1 && visual == 1){
		rotY += (mouse.y-prevMouse.y);
		//camera.position.x = zDistance*Math.cos(-rotY*10);
		camera.position.y = zDistance*Math.sin(-rotY*10);
	}
	if (move != "")
	  moveRotation = 0;

	prevMouse.x = mouse.x;
	prevMouse.y = mouse.y
	camera.lookAt( 0, 0, 0 );
	renderer.render( scene, camera );
}




function mousemoveHandler(event) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function mouseUpHandler() {
	mouseDown = false;
	if (pointingVector[0] != -1){
		//console.log(mouseUpCoord, mouse.x, mouse.y, Math.abs(mouseUpCoord[1] - mouse.y));
		if (Math.abs(mouseUpCoord[1] - mouse.y) > Math.abs(mouseUpCoord[0] - mouse.x) ) {
			if (mouse.y > mouseUpCoord[1]) move = "U";
			else move = "D";
		}else{
			if (mouse.x > mouseUpCoord[0]) move = "R";
			else move = "L";
		}
	}
}
window.addEventListener('keydown', function (e) {
	if (e.key == "x") visual = 0;
	if (e.key == "y") visual = 1;
  }, false);

document.addEventListener("mousemove", mousemoveHandler);
document.addEventListener("mousedown", function () {mouseDown = true; mouseUpCoord = [mouse.x, mouse.y];});
document.addEventListener("mouseup", mouseUpHandler);
animate();