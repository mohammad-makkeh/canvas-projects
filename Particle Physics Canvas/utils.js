export function add(v1, v2){
	return v1.map((_, i) => v1[i] + v2[i]);
}

export function subtract(v1, v2){
	return v1.map((_, i) => v1[i] - v2[i]);
}

export function distance(v1, v2){
	return Math.hypot(v1[0] - v2[0], v1[1] - v2[1]);
}


export function magnitude(v){
	return distance(v, new Array(v.length).fill(0));
}

export function scale(v, scalar){
	return v.map(c=>c*scalar)
}

export function normalize(v){
	return scale(v, 1/magnitude(v));
}




















