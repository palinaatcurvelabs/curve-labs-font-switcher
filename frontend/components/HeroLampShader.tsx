import React, { useRef, useEffect, useState, useCallback } from 'react';

interface HeroLampShaderProps {
  imageUrl: string;
  isHovered: boolean;
  mousePosition: { x: number; y: number };
}

// Vertex shader
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

// Fragment shader - light only hits the letters, spaces stay dark
const fragmentShaderSource = `
  precision highp float;

  uniform sampler2D u_image;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform float u_hover;
  uniform vec2 u_resolution;
  uniform vec2 u_texelSize;

  varying vec2 v_texCoord;

  // Sample the image to get height (alpha = presence of character)
  float getHeight(vec2 uv) {
    vec4 col = texture2D(u_image, uv);
    return col.a;
  }

  // Calculate normal from height map using sobel operator
  vec3 getNormal(vec2 uv) {
    vec2 texel = u_texelSize * 2.0;

    float tl = getHeight(uv + vec2(-texel.x, -texel.y));
    float t  = getHeight(uv + vec2(0.0, -texel.y));
    float tr = getHeight(uv + vec2(texel.x, -texel.y));
    float l  = getHeight(uv + vec2(-texel.x, 0.0));
    float r  = getHeight(uv + vec2(texel.x, 0.0));
    float bl = getHeight(uv + vec2(-texel.x, texel.y));
    float b  = getHeight(uv + vec2(0.0, texel.y));
    float br = getHeight(uv + vec2(texel.x, texel.y));

    float dX = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);
    float dY = (bl + 2.0 * b + br) - (tl + 2.0 * t + tr);

    float bumpStrength = 3.0;
    vec3 normal = normalize(vec3(-dX * bumpStrength, -dY * bumpStrength, 1.0));
    return normal;
  }

  void main() {
    vec4 texColor = texture2D(u_image, v_texCoord);

    // IMPORTANT: Only render where there are actual characters (alpha > 0)
    // Spaces between letters have alpha = 0 and will be completely transparent/dark
    if (texColor.a < 0.1) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      return;
    }

    // Get the surface normal at this pixel (edges of characters)
    vec3 normal = getNormal(v_texCoord);

    // Light position - mouse controls XY, Z is height above surface
    vec3 lightPos = vec3(u_mouse.x, 1.0 - u_mouse.y, 0.25);
    vec3 pixelPos = vec3(v_texCoord.x, v_texCoord.y, 0.0);

    // Light and view directions
    vec3 lightDir = normalize(lightPos - pixelPos);
    vec3 viewDir = vec3(0.0, 0.0, 1.0);

    // Distance-based falloff - light only reaches nearby characters
    float lightDist = distance(lightPos.xy, pixelPos.xy);
    float falloff = 1.0 - smoothstep(0.0, 0.4, lightDist);
    falloff = falloff * falloff; // Sharper falloff

    // Diffuse - how directly the surface faces the light
    float diffuse = max(dot(normal, lightDir), 0.0);

    // Specular - shiny highlights on edges facing the light
    vec3 halfDir = normalize(lightDir + viewDir);
    float specular = pow(max(dot(normal, halfDir), 0.0), 48.0);

    // Edge detection - characters' edges catch more specular light
    float edgeFactor = 1.0 - abs(dot(normal, viewDir));
    edgeFactor = pow(edgeFactor, 1.5);

    // Base ambient - very dim when not lit
    float ambient = 0.15;

    // Calculate final lighting - ONLY on the character pixels
    float litAmount = u_hover * falloff;

    // Combine: ambient + diffuse + specular (boosted on edges)
    float lightIntensity = ambient;
    lightIntensity += diffuse * 0.5 * litAmount;
    lightIntensity += specular * 1.5 * litAmount;
    lightIntensity += specular * edgeFactor * 0.8 * litAmount;

    // Subtle shimmer variation
    float shimmer = sin(v_texCoord.x * 80.0 + u_time * 1.2) *
                   sin(v_texCoord.y * 60.0 + u_time * 0.8) * 0.1;
    lightIntensity += shimmer * litAmount * edgeFactor;

    // Light color (slightly warm white)
    vec3 lightColor = vec3(1.0, 0.97, 0.92);

    // Final color - character color * lighting
    vec3 finalColor = texColor.rgb * lightIntensity * lightColor;

    // Add bright specular highlights as pure white
    finalColor += vec3(1.0) * specular * litAmount * 0.6;

    // The key: output only where alpha exists (characters only)
    // Spaces between characters remain completely dark/transparent
    gl_FragColor = vec4(finalColor, texColor.a);
  }
`;

export const HeroLampShader: React.FC<HeroLampShaderProps> = ({
  imageUrl,
  isHovered,
  mousePosition,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const hoverRef = useRef(0);
  const mouseSmoothRef = useRef({ x: 0.5, y: 0.5 });
  const imageSizeRef = useRef({ width: 0, height: 0 });

  const initWebGL = useCallback((canvas: HTMLCanvasElement, image: HTMLImageElement) => {
    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
      preserveDrawingBuffer: true
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

    // Create texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return { gl, program };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Load SVG as image
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      // Set canvas size for high quality
      const scale = window.devicePixelRatio || 1;
      const maxWidth = Math.min(window.innerWidth * 0.75, 1200);
      const aspectRatio = image.height / image.width;

      canvas.width = maxWidth * scale;
      canvas.height = maxWidth * aspectRatio * scale;
      canvas.style.width = `${maxWidth}px`;
      canvas.style.height = `${maxWidth * aspectRatio}px`;

      imageSizeRef.current = { width: canvas.width, height: canvas.height };

      const result = initWebGL(canvas, image);
      if (result) {
        glRef.current = result.gl;
        programRef.current = result.program;
        result.gl.viewport(0, 0, canvas.width, canvas.height);
        setIsLoaded(true);
      }
    };

    image.src = imageUrl;

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [imageUrl, initWebGL]);

  // Animation loop
  useEffect(() => {
    if (!isLoaded) return;

    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    if (!gl || !program || !canvas) return;

    const render = () => {
      gl.useProgram(program);

      // Smooth hover transition
      const targetHover = isHovered ? 1.0 : 0.0;
      hoverRef.current += (targetHover - hoverRef.current) * 0.08;

      // Smooth mouse movement
      mouseSmoothRef.current.x += (mousePosition.x - mouseSmoothRef.current.x) * 0.15;
      mouseSmoothRef.current.y += (mousePosition.y - mouseSmoothRef.current.y) * 0.15;

      // Set uniforms
      const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
      const timeLocation = gl.getUniformLocation(program, 'u_time');
      const hoverLocation = gl.getUniformLocation(program, 'u_hover');
      const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
      const texelSizeLocation = gl.getUniformLocation(program, 'u_texelSize');

      gl.uniform2f(mouseLocation, mouseSmoothRef.current.x, mouseSmoothRef.current.y);
      gl.uniform1f(timeLocation, (Date.now() - startTimeRef.current) / 1000);
      gl.uniform1f(hoverLocation, hoverRef.current);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(texelSizeLocation, 1.0 / canvas.width, 1.0 / canvas.height);

      // Enable blending
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isLoaded, isHovered, mousePosition]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        maxWidth: '1200px',
        height: 'auto',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    />
  );
};
