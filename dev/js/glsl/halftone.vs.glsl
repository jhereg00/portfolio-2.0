precision mediump float;

// attributes
// position is 2d coordinate relative to resolution (not -1.0 - 1.0)
// unfortunately, WebGL does not support geometry shaders, so positions are handled
// in the javascript
attribute vec2 aPosition;

// uniforms
uniform vec2 uResolution;
uniform float uMinSize;
uniform float uMaxSize;
uniform sampler2D uImage;
uniform sampler2D uMask;
uniform vec2 uDepths; // luminosity to treat as 0 and 1, respectively

// varyings
varying vec3 vPosition;

// constants
const int sizeToAverage = 2;

// helpers
void colorToGrayscale (in vec3 color, out float luminosity) {
  luminosity = (0.21 * color.r) + (0.72 * color.g) + (0.07 * color.b);
}

void squareToGrayscale (in vec2 middle, in sampler2D tex,out float luminosity) {
  vec2 onePixel = vec2(1.0) / uResolution;
  // set color to black, so we can add to it then divide to get the average
  vec3 color = vec3(0.0);

  int count = 0;
  for (int y = -sizeToAverage; y < sizeToAverage; ++y) {
    for (int x = -sizeToAverage; x < sizeToAverage; ++x) {
      vec2 offset = middle + vec2(float(x) * uMaxSize * onePixel.x, float(y) * uMaxSize * onePixel.y);

      if (offset.x >= 0.0 && offset.x <= 1.0 &&
          offset.y >= 0.0 && offset.y <= 1.0) {
        color += texture2D(tex, offset).rgb;
        ++count;
      }
    }
  }
  color /= float(count);
  colorToGrayscale(color, luminosity);
}

// main
void main() {
  gl_Position = vec4(aPosition / uResolution * 2.0 - 1.0, 0., 1.);
	float luminosity;
	float mask;
  squareToGrayscale(vec2((aPosition / uResolution).x, 1.0 - (aPosition / uResolution).y), uImage, luminosity);
  squareToGrayscale(vec2((aPosition / uResolution).x, 1.0 - (aPosition / uResolution).y), uMask, mask);
	// rebalance luminosity to the passed scale
	luminosity = (luminosity - uDepths[0]) / (uDepths[1] - uDepths[0]);
  gl_PointSize = uMaxSize * luminosity * mask;
  vPosition = gl_Position.xyz;
}
