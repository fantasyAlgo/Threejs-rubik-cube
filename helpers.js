//import * as THREE from 'three';

export let positionToIndex = (x, y, z) => [Math.round((z + 1.2)/1.2), Math.round(3*(x + 1.2)/1.2 + (y + 1.2)/1.2)];
export let rotationHandler = (theta) => [[Math.cos(theta), -Math.sin(theta)], [Math.sin(theta), Math.cos(theta)]];
export let matmul2d = (a, b) => [a[0][0] * b[0] + a[0][1] * b[1], a[1][0] * b[0] + a[1][1] * b[1]];

export function rotateXAxis(cube, theta){
	const quatX = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ).normalize(), theta );
	cube.applyQuaternion( quatX );
}
export function rotateYAxis(cube, theta){
	const quatY = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ).normalize(), theta );
	cube.applyQuaternion( quatY );
}
export function rotateZAxis(cube, theta){
	const quatZ = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ).normalize(), theta );
	cube.applyQuaternion( quatZ );
}

export function facingDirection(theta) {
	let mod = theta - (2*Math.PI)*Math.floor(theta/(2*Math.PI));
	const disp = 0.7;
	if (mod >= 0){
		if (mod < disp || mod > 2*Math.PI-disp) return 0;
		if (mod > Math.PI/2-disp && mod < Math.PI/2+disp) return 1;
		if (mod > Math.PI-disp && mod < Math.PI+disp) return 2;
		if (mod > 3*Math.PI/2-disp && mod < 3*Math.PI/2+disp) return 3;
	}else {
		if (mod > -disp || mod < 2*Math.PI-disp) return 3;
		if (mod > -Math.PI/2-disp && mod < -Math.PI/2+disp) return 2;
		if (mod > -Math.PI-disp && mod < -Math.PI-disp) return 1;
		if (mod > -3*Math.PI/2-disp && mod < -3*Math.PI/2+disp) return 0;
	}
	return -1;
}
