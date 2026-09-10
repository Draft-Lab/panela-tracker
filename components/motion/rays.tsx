"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { useReducedMotion } from "motion/react"
import * as THREE from "three"

type RaysColorConfig =
  | { mode: "single"; color: string }
  | { mode: "multi"; color1: string; color2: string }
  | { mode: "random" }

interface RaysProps {
  intensity?: number
  rays?: number
  reach?: number
  position?: number
  radius?: string
  backgroundColor?: string
  animation?: { animate: boolean; speed: number }
  raysColor?: RaysColorConfig
  style?: CSSProperties
  className?: string
}

type Rgb = [number, number, number]

const RAY_Y_POSITION_1 = -0.4
const RAY_Y_POSITION_2 = -0.5

export default function Rays({
  intensity = 13,
  rays = 32,
  reach = 16,
  position = 50,
  radius = "0px",
  backgroundColor = "#000",
  animation = { animate: true, speed: 10 },
  raysColor = { mode: "single", color: "#639AFF" },
  style,
  className,
}: RaysProps) {
  const reducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const frameIdRef = useRef<number | undefined>(undefined)
  const animationRef = useRef(animation)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    animationRef.current = animation
  }, [animation])

  const [randomColor1, randomColor2] = useMemo<[Rgb, Rgb]>(() => {
    if (raysColor.mode !== "random") return [[1, 1, 1], [1, 1, 1]]
    const hue = Math.random() * 360
    const saturation = 60 + Math.random() * 40
    return [hslToRgb(hue, saturation, 50), hslToRgb(hue, saturation, 65)]
  }, [raysColor.mode])

  const [color1, color2] = useMemo<[Rgb, Rgb]>(() => {
    if (raysColor.mode === "random") return [randomColor1, randomColor2]
    if (raysColor.mode === "multi") {
      return [colorToRgb(raysColor.color1), colorToRgb(raysColor.color2)]
    }
    return [colorToRgb(raysColor.color), colorToRgb(raysColor.color)]
  }, [raysColor, randomColor1, randomColor2])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !isMounted) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      premultipliedAlpha: true,
    })
    renderer.setPixelRatio(1)
    container.appendChild(renderer.domElement)

    const geometry = new THREE.PlaneGeometry(1024, 1024)
    const material = new THREE.ShaderMaterial({
      fragmentShader: FRAGMENT_SHADER,
      vertexShader: VERTEX_SHADER,
      uniforms: {
        u_colors: {
          value: [
            new THREE.Vector4(color1[0], color1[1], color1[2], 1),
            new THREE.Vector4(color2[0], color2[1], color2[2], 1),
          ],
        },
        u_intensity: { value: mapRange(intensity, 0, 100, 0, 0.5) },
        u_rays: { value: mapRange(rays, 0, 100, 0, 0.3) },
        u_reach: { value: mapRange(reach, 0, 100, 0, 0.5) },
        u_time: { value: Math.random() * 10000 },
        u_resolution: { value: [1, 1] },
        u_rayPos1: { value: [0, 0] },
        u_rayPos2: { value: [0, 0] },
      },
      side: THREE.DoubleSide,
      transparent: true,
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    meshRef.current = mesh

    const resize = () => {
      const width = Math.max(container.clientWidth, 1)
      const height = Math.max(container.clientHeight, 1)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      material.uniforms.u_resolution.value = [width, height]
      material.uniforms.u_rayPos1.value = [(position / 100) * width, RAY_Y_POSITION_1 * height]
      material.uniforms.u_rayPos2.value = [((position / 100) + 0.02) * width, RAY_Y_POSITION_2 * height]
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    let lastTime = 0
    const render = (time: number) => {
      const currentAnimation = animationRef.current
      const delta = time - lastTime
      lastTime = time

      if (currentAnimation.animate && !reducedMotion) {
        material.uniforms.u_time.value += (delta * currentAnimation.speed) / 10000
      }

      renderer.render(scene, camera)
      frameIdRef.current = requestAnimationFrame(render)
    }

    frameIdRef.current = requestAnimationFrame(render)
    return () => {
      if (frameIdRef.current !== undefined) cancelAnimationFrame(frameIdRef.current)
      resizeObserver.disconnect()
      meshRef.current = null
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [isMounted, reducedMotion])

  useEffect(() => {
    const material = meshRef.current?.material
    const container = containerRef.current
    if (!(material instanceof THREE.ShaderMaterial) || !container) return

    const width = container.clientWidth
    const height = container.clientHeight
    material.uniforms.u_colors.value = [
      new THREE.Vector4(color1[0], color1[1], color1[2], 1),
      new THREE.Vector4(color2[0], color2[1], color2[2], 1),
    ]
    material.uniforms.u_intensity.value = mapRange(intensity, 0, 100, 0, 0.5)
    material.uniforms.u_rays.value = mapRange(rays, 0, 100, 0, 0.3)
    material.uniforms.u_reach.value = mapRange(reach, 0, 100, 0, 0.5)
    material.uniforms.u_rayPos1.value = [(position / 100) * width, RAY_Y_POSITION_1 * height]
    material.uniforms.u_rayPos2.value = [((position / 100) + 0.02) * width, RAY_Y_POSITION_2 * height]
  }, [color1, color2, intensity, rays, reach, position])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: -1,
        borderRadius: radius,
        overflow: "hidden",
        backgroundColor,
        ...style,
      }}
    />
  )
}

function colorToRgb(hex: string): Rgb {
  const value = hex.replace("#", "")
  const normalized = value.length === 3 ? value.split("").map((part) => part + part).join("") : value
  return [
    Number.parseInt(normalized.slice(0, 2), 16) / 255,
    Number.parseInt(normalized.slice(2, 4), 16) / 255,
    Number.parseInt(normalized.slice(4, 6), 16) / 255,
  ]
}

function hslToRgb(hue: number, saturation: number, lightness: number): Rgb {
  const s = saturation / 100
  const l = lightness / 100
  const chroma = (1 - Math.abs(2 * l - 1)) * s
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const match = l - chroma / 2
  const [red, green, blue] = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x] : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x]
  return [red + match, green + match, blue + match]
}

function mapRange(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number) {
  return toLow + ((value - fromLow) / (fromHigh - fromLow)) * (toHigh - toLow)
}

const VERTEX_SHADER = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const FRAGMENT_SHADER = `
uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_colors[2];
uniform float u_intensity;
uniform float u_rays;
uniform float u_reach;
uniform vec2 u_rayPos1;
uniform vec2 u_rayPos2;

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
  float diagonal = length(u_resolution);
  return clamp((.45 + .15 * sin(cosAngle * seedA + u_time * speed)) + (.3 + .2 * cos(-cosAngle * seedB + u_time * speed)), u_reach, 1.0) * clamp((diagonal - length(sourceToCoord)) / diagonal, u_reach, 1.0);
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
  float speed = u_rays * 10.0;
  float strength1 = rayStrength(u_rayPos1, normalize(vec2(1.0, -.116)), coord, 36.2214 * speed, 21.11349 * speed, 1.5 * speed);
  float strength2 = rayStrength(u_rayPos2, normalize(vec2(1.0, .241)), coord, 22.39910 * speed, 18.0234 * speed, 1.1 * speed);
  float brightness = u_reach - (coord.y / u_resolution.y);
  float attenuation = clamp(brightness + (.5 + u_intensity), 0.0, 1.0);
  float alpha1 = strength1 * attenuation;
  float alpha2 = strength2 * attenuation;
  vec3 blendedColor = u_colors[0].rgb * alpha1 + u_colors[1].rgb * alpha2;
  float blendedAlpha = alpha1 + alpha2 * (1.0 - alpha1);
  gl_FragColor = vec4(blendedColor, blendedAlpha);
}
`
