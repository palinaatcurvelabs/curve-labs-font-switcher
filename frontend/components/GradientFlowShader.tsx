import React, { useRef, useEffect, useState, useCallback } from 'react';

interface GradientFlowShaderProps {
  className?: string;
}

// Vertex shader
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 vUv;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    vUv = a_texCoord;
  }
`;

// Fragment shader - flowing mesh gradient with organic movement
const fragmentShaderSource = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;

  varying vec2 vUv;

  const float PI = 3.14159265359;

  // Simplex-like noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                           dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // FBM for richer noise
  float fbm(vec2 p) {
    float f = 0.0;
    float w = 0.5;
    for (int i = 0; i < 5; i++) {
      f += w * snoise(p);
      p *= 2.0;
      w *= 0.5;
    }
    return f;
  }

  void main() {
    vec2 uv = vUv;
    float aspectRatio = uResolution.x / uResolution.y;
    
    // Center UV
    vec2 centeredUv = uv - 0.5;
    centeredUv.x *= aspectRatio;
    
    float time = uTime * 0.15;
    
    // Create flowing distortion
    vec2 distortion = vec2(
      fbm(centeredUv * 2.0 + time * 0.5),
      fbm(centeredUv * 2.0 + time * 0.5 + 100.0)
    );
    
    // Apply distortion
    vec2 distortedUv = centeredUv + distortion * 0.3;
    
    // Create multiple gradient layers
    float n1 = fbm(distortedUv * 1.5 + time);
    float n2 = fbm(distortedUv * 2.0 - time * 0.7 + 50.0);
    float n3 = fbm(distortedUv * 3.0 + time * 0.3 + 25.0);
    
    // Color palette - deep purples, blues, and magentas
    vec3 color1 = vec3(0.08, 0.02, 0.15);  // Deep purple-black
    vec3 color2 = vec3(0.15, 0.05, 0.25);  // Dark purple
    vec3 color3 = vec3(0.25, 0.08, 0.35);  // Purple
    vec3 color4 = vec3(0.4, 0.1, 0.5);     // Magenta-purple
    vec3 color5 = vec3(0.1, 0.15, 0.3);    // Deep blue
    
    // Mix colors based on noise
    vec3 col = mix(color1, color2, smoothstep(-0.5, 0.5, n1));
    col = mix(col, color3, smoothstep(-0.3, 0.7, n2));
    col = mix(col, color4, smoothstep(0.0, 0.8, n3) * 0.6);
    col = mix(col, color5, smoothstep(-0.2, 0.6, n1 * n2) * 0.4);
    
    // Add subtle highlights
    float highlight = smoothstep(0.4, 0.8, n1 * n2 + n3 * 0.5);
    col += vec3(0.5, 0.3, 0.6) * highlight * 0.15;
    
    // Radial vignette
    float dist = length(centeredUv);
    float vignette = 1.0 - smoothstep(0.3, 0.9, dist);
    col *= vignette * 0.8 + 0.2;
    
    // Subtle grain
    float grain = fract(sin(dot(uv * 1000.0, vec2(12.9898, 78.233))) * 43758.5453);
    col += (grain - 0.5) * 0.02;
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const GradientFlowShader: React.FC<GradientFlowShaderProps> = ({ className }) => {
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
