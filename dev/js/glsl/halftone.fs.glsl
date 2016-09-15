// halftone fragment shader
precision mediump float;

// uniforms
uniform sampler2D uPointSprite;

// varyings
varying vec3 vColor;

void main (void) {
  gl_FragColor = texture2D(uPointSprite, gl_PointCoord);
}
