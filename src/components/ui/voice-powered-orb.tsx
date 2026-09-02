"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils/cn";
import type { DemoStatus } from "@/hooks/useDemo";

// ============================================================================
// GLSL SHADERS
// ============================================================================

const noise3D = `
// Simplex 3D Noise 
// by Ian McEwan, Ashima Arts
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

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

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const vertexShader = `
uniform float uTime;
uniform float uAmplitude;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorBase;
uniform vec3 uColorGlow;
uniform vec3 uColorCore;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vPosition;

${noise3D}

void main() {
  // 1. Soft Fresnel Edge Falloff
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = dot(normal, viewDir);
  
  // Smoothstep to fade alpha out safely before the sphere edge
  float edgeAlpha = smoothstep(0.1, 0.7, fresnel);
  
  // 2. Layered Domain Warping (Aurora / Plasma Ribbons)
  float time = uTime * 0.2; // Slower flow
  vec3 p = vPosition * 0.5; // Lower frequency, no tight marbles
  
  // Base noise
  float q1 = snoise(p + vec3(time, time * 0.5, 0.0));
  float q2 = snoise(p + vec3(-time * 0.8, time * 1.2, time * 0.5));
  
  // Domain warp
  float q = snoise(p + vec3(q1, q2, time) * 0.5); // Lower warp scale (0.5 instead of 1.5)
  
  // Flowing ribbon bands using sine waves
  float band1 = sin(q * 2.0 + time * 1.0);
  float band2 = sin(q1 * 1.5 - time * 0.8);
  float bands = (band1 + band2) * 0.5;
  bands = smoothstep(-0.1, 0.9, bands); // Softer ribbons
  
  // 3. Audio Reactivity
  float audioGlow = uAmplitude * 0.6; // Less blown out
  
  // 4. Color Drifting
  // Base gradient: Periwinkle blue to violet
  vec3 color = mix(uColorBase, uColorGlow, bands + audioGlow * 0.2);
  
  // Add drifting warm magenta/pink blob
  float blobNoise = snoise(p * 0.4 + vec3(time * 0.3, -time * 0.2, time));
  float blobIntensity = smoothstep(0.2, 0.9, blobNoise) * 0.35; // Capped at 35% opacity
  color = mix(color, vec3(1.0, 0.2, 0.6), blobIntensity);
  
  // Inner core brightness (soft lavender/blue, NOT pure white)
  float coreIntensity = smoothstep(0.6, 1.0, fresnel);
  color = mix(color, uColorCore, coreIntensity * bands * 0.5); // Capped
  
  // 5. Final Alpha Composition
  float finalAlpha = edgeAlpha * (0.6 + bands * 0.4 + audioGlow * 0.4);
  
  gl_FragColor = vec4(color, finalAlpha);
}
`;

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================

interface VoiceOrbProps {
  status?: DemoStatus | "active";
  analyser?: AnalyserNode | null;
  className?: string;
  enableVoiceControl?: boolean;
}

const COLORS = {
  brandOrange: new THREE.Color("#ff6600"),    // Primary brand orange
  lightOrange: new THREE.Color("#ff9966"),    // Soft orange glow
  peach: new THREE.Color("#ffccb3"),          // Soft core
  yellowGlow: new THREE.Color("#ffd633"),     // Golden glow for active state
  deepOrange: new THREE.Color("#cc5200"),
  magentaAccent: new THREE.Color("#ff3366"),  // Warm accent for processing
  white: new THREE.Color("#ffffff"),
  grey: new THREE.Color("#4b5563"),
};

const STATE_CONFIG = {
  idle: {
    base: COLORS.brandOrange,
    glow: COLORS.lightOrange,
    core: COLORS.peach,
    speedMultiplier: 1.0,
    baseScale: 1.0,
  },
  listening: {
    base: COLORS.yellowGlow,
    glow: COLORS.brandOrange,
    core: COLORS.peach,
    speedMultiplier: 1.5,
    baseScale: 1.05,
  },
  processing: {
    base: COLORS.brandOrange,
    glow: COLORS.magentaAccent,
    core: COLORS.peach,
    speedMultiplier: 2.5,
    baseScale: 1.0,
  },
  playing: {
    base: COLORS.magentaAccent,
    glow: COLORS.lightOrange,
    core: COLORS.peach,
    speedMultiplier: 1.8,
    baseScale: 1.1,
  },
  error: {
    base: new THREE.Color("#ef4444"),
    glow: new THREE.Color("#991b1b"),
    core: COLORS.peach,
    speedMultiplier: 0.5,
    baseScale: 0.95,
  },
  ended: {
    base: COLORS.grey,
    glow: new THREE.Color("#1f2937"),
    core: COLORS.grey,
    speedMultiplier: 0.2,
    baseScale: 0.9,
  },
};

const mapStatus = (status: DemoStatus | "active" | undefined) => {
  if (!status) return STATE_CONFIG.idle;
  if (status === 'active') return STATE_CONFIG.listening;
  if (status === 'idle' || status === 'connecting') return STATE_CONFIG.idle;
  if (status === 'processing') return STATE_CONFIG.processing;
  if (status === 'playing') return STATE_CONFIG.playing;
  if (status === 'error') return STATE_CONFIG.error;
  if (status === 'ended') return STATE_CONFIG.ended;
  return STATE_CONFIG.idle;
};

// ============================================================================
// 3D ORB MESH COMPONENT
// ============================================================================

const OrbMesh = ({ status, analyser }: { status?: DemoStatus | "active", analyser?: AnalyserNode | null }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (analyser) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    } else {
      dataArrayRef.current = null;
    }
  }, [analyser]);

  // Smoothed states
  const amplitudeRef = useRef(0);
  const timeRef = useRef(0);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAmplitude: { value: 0 },
    uColorBase: { value: COLORS.brandOrange.clone() },
    uColorGlow: { value: COLORS.lightOrange.clone() },
    uColorCore: { value: COLORS.peach.clone() },
  }), []);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    
    const target = mapStatus(status);
    timeRef.current += delta * target.speedMultiplier;
    
    // Fetch Audio Amplitude
    let currentAmplitude = 0;
    if (analyser && dataArrayRef.current) {
      analyser.getByteFrequencyData(dataArrayRef.current as any);
      let sum = 0;
      const maxBin = Math.floor(dataArrayRef.current.length * 0.4); 
      for (let i = 0; i < maxBin; i++) {
        sum += dataArrayRef.current[i];
      }
      currentAmplitude = (sum / maxBin) / 255.0;
    }

    // Smooth amplitude transitions for fluid motion
    amplitudeRef.current = THREE.MathUtils.lerp(amplitudeRef.current, currentAmplitude, 0.1);
    
    // Pass uniforms
    uniforms.uTime.value = timeRef.current;
    uniforms.uAmplitude.value = amplitudeRef.current;
    uniforms.uColorBase.value.lerp(target.base, 0.05);
    uniforms.uColorGlow.value.lerp(target.glow, 0.05);
    uniforms.uColorCore.value.lerp(target.core, 0.05);

    // Rotate Mesh slowly for parallax volume
    meshRef.current.rotation.y += delta * 0.1 * target.speedMultiplier;
    meshRef.current.rotation.x += delta * 0.05 * target.speedMultiplier;

    // Slow breathing scale + audio pulse expansion
    const breathingScale = 1.0 + Math.sin(timeRef.current * 0.5) * 0.05;
    const pulseScale = target.baseScale * breathingScale + (amplitudeRef.current * 0.25);
    meshRef.current.scale.lerp(new THREE.Vector3(pulseScale, pulseScale, pulseScale), 0.1);
  });

  return (
    <Sphere ref={meshRef} args={[1.5, 128, 128]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </Sphere>
  );
};

// ============================================================================
// MAIN EXPORT
// ============================================================================

export const VoicePoweredOrb = ({ status, analyser, className, enableVoiceControl }: VoiceOrbProps) => {
  const activeStatus = status || (enableVoiceControl ? 'active' : 'idle');

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Soft radial background glow (CSS) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-purple-500/5 to-transparent blur-[64px] rounded-full scale-150 pointer-events-none" />
      
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        {/* NO PHYSICAL LIGHTS. The orb is a fully unlit, self-illuminating plasma shader. */}
        <OrbMesh status={activeStatus as DemoStatus} analyser={analyser} />
      </Canvas>
    </div>
  );
};
