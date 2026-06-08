import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { eciToThree } from '../utils/coords'
import { satColor, COLORS } from '../utils/colors'
import { getRiskColor } from '../utils/collision'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

const EARTH_RADIUS = 6.371   // in Three.js units (1 unit = 1000 km)

// ── Earth sphere ─────────────────────────────────────────────────────────────
function Earth() {
  const meshRef = useRef()

  // Free NASA Blue Marble texture
  const texture = useLoader(
    THREE.TextureLoader,
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
  )

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshPhongMaterial map={texture} specular="#224488" shininess={8} />
    </mesh>
  )
}

// ── Atmosphere glow ───────────────────────────────────────────────────────────
function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS * 1.02, 32, 32]} />
      <meshPhongMaterial
        color="#1d4ed8"
        transparent
        opacity={0.08}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

// ── Single satellite dot ──────────────────────────────────────────────────────
function SatelliteDot({ position, color, size = 0.03, onClick, isSelected, riskColor }) {
  const dotColor = riskColor || color
  return (
    <mesh position={position} onClick={onClick}>
      <sphereGeometry args={[isSelected ? size * 2 : size, 8, 8]} />
      <meshBasicMaterial color={dotColor} />
    </mesh>
  )
}

// ── Orbit line (actual / predicted / future) ──────────────────────────────────
function OrbitLine({ points, color, opacity = 1, dashed = false }) {
  const geometry = useMemo(() => {
    if (!points || points.length < 2) return null
    const positions = new Float32Array(points.length * 3)
    points.forEach((p, i) => {
      positions[i * 3] = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [points])

  if (!geometry) return null

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  )
}

// ── One satellite with all its tracks ────────────────────────────────────────
function SatelliteTrack({ sat, currentStep, onSelect, isSelected, threatRisk }) {
  const color = satColor(sat.index)
  const riskColor = threatRisk ? getRiskColor(threatRisk) : null

  // Convert all trajectory arrays to Three.js vectors
  const actualPts = useMemo(() =>
    sat.actual.map(([x, y, z]) => eciToThree(x, y, z)), [sat.actual])

  const predictedPts = useMemo(() =>
    sat.predicted.map(([x, y, z]) => eciToThree(x, y, z)), [sat.predicted])

  const futurePts = useMemo(() =>
    (sat.future || []).slice(0, currentStep + 1).map(([x, y, z]) => eciToThree(x, y, z)),
    [sat.future, currentStep])

  // Current position = future[currentStep] or last actual
  const currentPos = useMemo(() => {
    const src = sat.future?.[currentStep] || sat.actual[sat.actual.length - 1]
    return eciToThree(...src)
  }, [sat, currentStep])

  return (
    <group>
      {/* Historical track — thin, dim blue */}
      <OrbitLine points={actualPts} color="#1e40af" opacity={0.25} />
      {/* Model prediction — bright purple, visible */}
      <OrbitLine points={predictedPts} color="#a78bfa" opacity={0.9} />
      {/* Animated future — bright green */}
      <OrbitLine points={futurePts} color="#34d399" opacity={0.7} />
      {/* Current position dot */}
      <SatelliteDot
        position={[currentPos.x, currentPos.y, currentPos.z]}
        color={color}
        riskColor={riskColor}
        isSelected={isSelected}
        onClick={(e) => { e.stopPropagation(); onSelect(sat) }}
      />
    </group>
  )
}

// ── Scene ─────────────────────────────────────────────────────────────────────
function Scene({ satellites, currentStep, onSelectSat, selectedSat, threats }) {
  // Build a map of sat id → risk for quick lookup
  const threatMap = useMemo(() => {
    const m = {}
    threats.forEach(t => {
      if (!m[t.satA] || t.risk === 'CRITICAL') m[t.satA] = t.risk
      if (!m[t.satB] || t.risk === 'CRITICAL') m[t.satB] = t.risk
    })
    return m
  }, [threats])

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4488ff" />

      <Stars radius={200} depth={60} count={3000} factor={3} fade />
      <Earth />
      <Atmosphere />

      {satellites.map(sat => (
        <SatelliteTrack
          key={sat.id}
          sat={sat}
          currentStep={currentStep}
          onSelect={onSelectSat}
          isSelected={selectedSat?.id === sat.id}
          threatRisk={threatMap[sat.id]}
        />
      ))}
    </>
  )
}

// ── Main Globe export ─────────────────────────────────────────────────────────
export default function Globe({ satellites, currentStep, onSelectSat, selectedSat, threats }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 45, near: 0.1, far: 1000 }}
      style={{ background: '#020817' }}
    >
      <Scene
        satellites={satellites}
        currentStep={currentStep}
        onSelectSat={onSelectSat}
        selectedSat={selectedSat}
        threats={threats}
      />
      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={60}
        rotateSpeed={0.4}
        zoomSpeed={0.6}
      />
    </Canvas>
  )
}
