// Fragment shaders don't have a default precision so we need to pick one. Mediump is a good default.
precision mediump float;

void main() {
	gl_FragColor = vec4(1, 0, 0.5, 1); // Return redish-purple
}