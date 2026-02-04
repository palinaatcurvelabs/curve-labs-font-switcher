import React, { useRef, useEffect, useState, useCallback } from 'react';

interface FlowerNoiseShaderProps {
  className?: string;
}

// Vertex shader
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 vTextureCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    vTextureCoord = a_texCoord;
  }
`;

// Fragment shader - dithered/dotted organic blob pattern
const fragmentShaderSource = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;

  varying vec2 vTextureCoord;

  const float PI = 3.14159265359;
  const float TAU = 6.28318530718;

  // Hash function for voronoi
  vec3 hash3(vec2 p) {
    vec3 q = vec3(
      dot(p, vec2(127.1, 311.7)),
      dot(p, vec2(269.5, 183.3)),
      dot(p, vec2(419.2, 371.9))
    );
    return fract(sin(q) * 43758.5453);
  }

  // Rotation matrix
  mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
  }

  // Voronoi noise for the organic blob shape
  float voronoise(vec2 uv, float time) {
    float u = 1.0;
    float v = 1.0;

    vec2 x = uv * 2.0;

    vec2 p = floor(x);
    vec2 f = fract(x);

    float k = 1.0 + 63.0 * pow(1.0 - v, 4.0);
    float va = 0.0;
    float wt = 0.0;

    for (int j = -2; j <= 2; j++) {
      for (int i = -2; i <= 2; i++) {
        vec2 g = vec2(float(i), float(j));
        vec3 o = hash3(p + g) * vec3(u, u, 1.0);

        // Animate the cells slowly
        o.xy += 0.5 * vec2(
          sin(time * 0.1 + o.x * TAU),
          cos(time * 0.1 + o.y * TAU)
        );

        vec2 r = g - f + o.xy;
        float d = dot(r, r);
        float ww = pow(1.0 - smoothstep(0.0, 1.414, sqrt(d)), k);
        va += o.z * ww;
        wt += ww;
      }
    }

    return va / max(wt, 0.00001);
  }

  // Polar coordinate transformation for the flower/radial effect
  vec2 polar(vec2 uv, vec2 center, float time) {
    uv -= center;
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);

    // Rotate over time
    float xCoord = mod((angle + 0.5778 * TAU) + (time * 0.05) + PI, TAU) / TAU;
    float yCoord = radius * 0.46;
    float gamma = pow(2.0, -0.52);
    yCoord = pow(fract(yCoord), gamma);

    return fract(vec2(yCoord, xCoord));
  }

  void main() {
    vec2 uv = vTextureCoord;
    float aspectRatio = uResolution.x / uResolution.y;
    vec2 aspect = vec2(aspectRatio, 1.0);

    vec2 center = vec2(0.5, 0.5);

    // Apply polar transformation
    vec2 polarCoord = polar(uv * aspect, center * aspect, uTime);

    // Get voronoi noise value
    float noise = voronoise(polarCoord * 3.5, uTime);

    // Apply noise distortion
    noise = mix(0.5, noise, 1.5);
    noise = smoothstep(0.3, 0.7, noise);

    // Create the dithered dot pattern
    float dotScale = 80.0; // Size of the dot grid
    vec2 dotUV = uv * vec2(aspectRatio, 1.0) * dotScale;
    vec2 dotCell = floor(dotUV);
    vec2 dotPos = fract(dotUV) - 0.5;

    // Sample noise at dot center for threshold
    vec2 cellCenter = (dotCell + 0.5) / dotScale / vec2(aspectRatio, 1.0);
    vec2 cellPolar = polar(cellCenter * aspect, center * aspect, uTime);
    float cellNoise = voronoise(cellPolar * 3.5, uTime);
    cellNoise = mix(0.5, cellNoise, 1.5);
    cellNoise = smoothstep(0.25, 0.75, cellNoise);

    // Distance from center of cell (for dot shape)
    float dotDist = length(dotPos);

    // Vary dot size based on noise value
    float dotRadius = cellNoise * 0.45;

    // Create dot
    float dot = 1.0 - smoothstep(dotRadius - 0.05, dotRadius + 0.05, dotDist);

    // Fade out towards edges (vignette)
    float dist = distance(uv, center);
    float vignette = 1.0 - smoothstep(0.2, 0.6, dist);

    // Final color - white dots on black background
    float brightness = dot * vignette * 0.8;

    // Subtle gray variation
    vec3 color = vec3(brightness);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const FlowerNoiseShader: React.FC<FlowerNoiseShaderProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const initWebGL = useCallback((canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true
    });

    if (!gl) {
      console.error('WebGL not supported');
      return null;
    }

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader error:', gl.getShaderInfoLog(vertexShader));
      return null;
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader error:', gl.getShaderInfoLog(fragmentShader));
      return null;
    }

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return null;
    }

    // Set up geometry
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const texCoords = new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    return { gl, program };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const scale = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      canvas.width = width * scale;
      canvas.height = height * scale;

      if (glRef.current) {
        glRef.current.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    const result = initWebGL(canvas);
    if (result) {
      glRef.current = result.gl;
      programRef.current = result.program;
      updateSize();
      setIsLoaded(true);
    }

    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initWebGL]);

  // Animation loop
  useEffect(() => {
    if (!isLoaded) return;

    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    if (!gl || !program || !canvas) return;

    const render = () => {
      gl.useProgram(program);

      const timeLocation = gl.getUniformLocation(program, 'uTime');
      const resolutionLocation = gl.getUniformLocation(program, 'uResolution');

      gl.uniform1f(timeLocation, (Date.now() - startTimeRef.current) / 1000);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isLoaded]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.5s ease'
      }}
    />
  );
};
