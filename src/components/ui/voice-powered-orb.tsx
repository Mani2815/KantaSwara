'use client';

import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Program, Mesh, Sphere } from 'ogl';

export type OrbStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'ended' | 'connecting' | 'active' | 'processing' | 'playing' | 'error';

interface VoicePoweredOrbProps {
  status: OrbStatus;
  className?: string;
}

const vertex = `
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;

  uniform float uTime;
  uniform float uDisplacement;
  uniform float uSpeed;

  varying vec2 vUv;
  varying vec3 vNormal;

  // Simple noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

    // Permutations
    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    float noise = snoise(position * 2.0 + uTime * uSpeed);
    vec3 newPosition = position + normal * noise * uDisplacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragment = `
  precision highp float;

  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
    vec3 glow = mix(uColorA, uColorB, intensity);
    gl_FragColor = vec4(glow, 1.0);
  }
`;

export function VoicePoweredOrb({ status, className = '' }: VoicePoweredOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const programRef = useRef<Program | null>(null);
  const rafId = useRef<number>(0);

  // Parse status to standard orb states
  let currentStatus = status;
  if (status === 'connecting' || status === 'idle' || status === 'error') currentStatus = 'idle';
  else if (status === 'active' || status === 'listening') currentStatus = 'listening';
  else if (status === 'processing') currentStatus = 'thinking';
  else if (status === 'playing' || status === 'speaking') currentStatus = 'speaking';
  else if (status === 'ended') currentStatus = 'ended';

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize WebGL context
    const renderer = new Renderer({ alpha: true, antialias: true, dpr: 2 });
    const gl = renderer.gl;
    containerRef.current.appendChild(gl.canvas);
    rendererRef.current = renderer;

    const camera = new Camera(gl, { fov: 45 });
    camera.position.set(0, 0, 5);

    const scene = new Transform();

    const geometry = new Sphere(gl, {
      radius: 1.5,
      widthSegments: 64,
      heightSegments: 64,
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uDisplacement: { value: 0.1 },
        uSpeed: { value: 0.5 },
        uColorA: { value: [0.3, 0.1, 0.8] }, // Deep purple
        uColorB: { value: [0.6, 0.2, 1.0] }, // Bright purple
      },
      transparent: true,
      cullFace: null,
    });
    programRef.current = program;

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    let lastTime = 0;
    const update = (time: number) => {
      const delta = (time - lastTime) * 0.001;
      lastTime = time;

      if (programRef.current) {
        programRef.current.uniforms.uTime.value += delta;
      }

      renderer.render({ scene, camera });
      rafId.current = requestAnimationFrame(update);
    };

    rafId.current = requestAnimationFrame(update);

    const resize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      rendererRef.current.setSize(clientWidth, clientHeight);
      camera.perspective({ aspect: clientWidth / clientHeight });
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    const container = containerRef.current;

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId.current);
      if (container && gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
      
      if (gl) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
    };
  }, []);

  // Update uniforms based on status
  useEffect(() => {
    if (!programRef.current) return;
    const uniforms = programRef.current.uniforms;

    // Target values based on status
    const targetColors = {
      idle: { a: [0.3, 0.3, 0.4], b: [0.5, 0.5, 0.6], d: 0.05, s: 0.2 },
      ended: { a: [0.2, 0.2, 0.2], b: [0.4, 0.4, 0.4], d: 0.0, s: 0.0 },
      listening: { a: [0.2, 0.1, 0.7], b: [0.5, 0.3, 1.0], d: 0.15, s: 0.8 },
      thinking: { a: [0.4, 0.1, 0.8], b: [0.8, 0.2, 1.0], d: 0.25, s: 1.5 },
      speaking: { a: [0.5, 0.1, 1.0], b: [1.0, 0.4, 1.0], d: 0.4, s: 2.5 },
    };

    const target = targetColors[currentStatus as keyof typeof targetColors] || targetColors.idle;

    // Simple tweening for smooth transition
    const startA = [...uniforms.uColorA.value];
    const startB = [...uniforms.uColorB.value];
    const startD = uniforms.uDisplacement.value;
    const startS = uniforms.uSpeed.value;

    const duration = 500;
    const startTime = performance.now();

    let tweenRaf: number;
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      uniforms.uColorA.value = startA.map((v, i) => v + (target.a[i] - v) * ease);
      uniforms.uColorB.value = startB.map((v, i) => v + (target.b[i] - v) * ease);
      uniforms.uDisplacement.value = startD + (target.d - startD) * ease;
      uniforms.uSpeed.value = startS + (target.s - startS) * ease;

      if (progress < 1.0) {
        tweenRaf = requestAnimationFrame(animate);
      }
    };

    tweenRaf = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(tweenRaf);
  }, [currentStatus]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full min-h-[200px] flex items-center justify-center ${className}`} 
      style={{ touchAction: 'none' }}
    />
  );
}
