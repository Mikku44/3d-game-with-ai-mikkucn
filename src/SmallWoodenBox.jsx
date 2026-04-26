import { useGLTF, Html } from '@react-three/drei'
import { useBox } from '@react-three/cannon'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useStore } from './Game'
import useKeyboard from './useKeyboard'

// --- Audio Setup ---
const openSound = new Audio('/sounds/open.mp3')
openSound.volume = 0.1

// Reusable raycaster aimed at screen center (crosshair)
const _raycaster = new THREE.Raycaster()
const _center = new THREE.Vector2(0, 0) // NDC center = crosshair

export default function SmallWoodenBox(props) {
  const { scene } = useGLTF('/models/small_wooden_box/scene.gltf')
  const [ref] = useBox(() => ({
    mass: 0,
    args: [0.476, 0.162, 0.348],
    ...props
  }))

  const { playerPosition, showBoxOverlay } = useStore()
  const keyboard = useKeyboard()
  const { camera } = useThree()

  const lastEPress = useRef(false)
  const meshRef = useRef()           // invisible mesh for raycast hit detection
  const [isAimed, setIsAimed] = useState(false)

  useFrame(() => {
    // ── Crosshair raycast ──────────────────────────────────────────────
    _raycaster.setFromCamera(_center, camera)

    if (meshRef.current) {
      const hits = _raycaster.intersectObject(meshRef.current, true)
      const aimed = hits.length > 0 && hits[0].distance < 4 // max interaction distance
      setIsAimed(aimed)
    }

    // ── Distance + E key interaction ───────────────────────────────────
    const distance = Math.sqrt(
      (playerPosition[0] - props.position[0]) ** 2 +
      (playerPosition[1] - props.position[1]) ** 2 +
      (playerPosition[2] - props.position[2]) ** 2
    )
    const isClose = distance < 2
    const ePressed = keyboard['KeyE']

    if (isClose && ePressed && !lastEPress.current) {
      // Play open sound
      openSound.currentTime = 0
      openSound.play().catch(() => {})
      
      // Toggle UI overlay (remove/show when pressing E)
      useStore.setState({ showBoxOverlay: !showBoxOverlay })
    }
    lastEPress.current = ePressed
  })

  return (
    <group ref={ref}>
      {/* Visual model */}
      <primitive object={scene.clone()} scale={0.1} />

      {/* Invisible hit mesh for crosshair raycast — matches collider size */}
      <mesh ref={meshRef} visible={false}>
        <boxGeometry args={[0.476, 0.162, 0.348]} />
        <meshBasicMaterial />
      </mesh>

      {/* Crosshair hint — renders as DOM via Html, always faces camera */}
      {isAimed && !showBoxOverlay && (
        <Html
          center
          position={[0, 0.22, 0]}
          distanceFactor={2}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
       
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            transform:'scale(1.8)',
            gap: '7px',
            background: 'rgba(10, 8, 6, 0.82)',
            border: '1px solid rgba(210, 175, 100, 0.55)',
            borderRadius: '6px',
            padding: '5px 11px 5px 8px',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 2px 18px rgba(0,0,0,0.55)',
            whiteSpace: 'nowrap',
            fontFamily: "'Courier New', monospace",
          }}>
            {/* [E] key badge */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              background: 'rgba(210, 175, 100, 0.18)',
              border: '1.5px solid rgba(210, 175, 100, 0.8)',
              borderRadius: '4px',
              color: '#d2af64',
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: 0,
              lineHeight: 1,
            }}>
              E
            </span>
            <span style={{
              color: '#e8dcc8',
              fontSize: '12px',
              letterSpacing: '0.04em',
              fontWeight: 500,
            }}>
              Look Inside
            </span>
          </div>
        </Html>
      )}
    </group>
  )
}

useGLTF.preload('/models/small_wooden_box/scene.gltf')