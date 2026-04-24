import { useRef, useState, useEffect } from 'react'
import { useBox } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from './Game'

export default function Monster({ position }) {
  const [health, setHealth] = useState(100)
  const [isDead, setIsDead] = useState(false)
  const { playerPosition, monsters, bossHealth, bossMaxHealth } = useStore()
  const { scene } = useGLTF('/models/chair_monster.glb')
//   const [texture0, texture1] = useTexture(['/models/eye-monster/textures/gltf_embedded_0.jpeg', '/models/eye-monster/textures/gltf_embedded_1.jpeg'])
  const currentVelocity = useRef([0, 0, 0])
  const isDeadRef = useRef(false)

  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [0.8, 0.6, 2.8],
    material: 'monster',
    linearDamping: 0.9,   // stops sliding
    angularDamping: 1.0,  // stops spinning on collision
    fixedRotation: true,  // stops physics tipping it over
  }))

  // Track live velocity so we can preserve Y (gravity)
  useEffect(() => {
    const unsub = api.velocity.subscribe(v => { currentVelocity.current = v })
    return unsub
  }, [api])

  useEffect(() => {
    monsters.push(ref)
    return () => {
      const index = monsters.indexOf(ref)
      if (index > -1) monsters.splice(index, 1)
    }
  }, [monsters, ref])

  // Apply textures to the model
  

  const bobRef = useRef()

  useFrame((state) => {
    if (!ref.current || isDeadRef.current) return

    const dx = playerPosition[0] - ref.current.position.x
    const dz = playerPosition[2] - ref.current.position.z
    const distance = Math.sqrt(dx * dx + dz * dz)

    const SPEED = 4       // physics units/sec — was 0.02 which is near-zero
    const STOP_DIST = 1.2

    if (distance > STOP_DIST) {
      api.velocity.set(
        (dx / distance) * SPEED,
        currentVelocity.current[1], // preserve Y so gravity still works
        (dz / distance) * SPEED
      )
      // Rotate to face player — safe because fixedRotation=true
      ref.current.rotation.y = Math.atan2(dx, dz)
    } else {
      api.velocity.set(0, currentVelocity.current[1], 0)
    }

    // Bob the child group, NOT the physics body
    if (bobRef.current) {
      const moving = Math.hypot(currentVelocity.current[0], currentVelocity.current[2]) > 0.1
      const bob = moving ? Math.sin(state.clock.elapsedTime * 8) * 0.05 : 0
      bobRef.current.position.y = bob
      // Update physics body Y to follow the visual
      api.position.set(ref.current.position.x, position[1] + bob, ref.current.position.z)
    }
  })

  const takeDamage = (amount) => {
    if (isDeadRef.current) return

    setHealth(prev => {
      const newHealth = Math.max(0, prev - amount)
      useStore.setState({ bossHealth: newHealth }) // Update global boss health
      if (newHealth <= 0) {
        isDeadRef.current = true
        setIsDead(true)
        ref.current.visible = false
        api.velocity.set(0, 0, 0)
        useStore.setState(state => {
          const newCount = state.enemyCount - 1
          return { enemyCount: newCount, showWinner: newCount === 0 }
        })
      }
      return newHealth
    })
  }

  useEffect(() => {
    if (ref.current) {
      ref.current.takeDamage = takeDamage
    }
  }, [ref.current])

  return (
    <group ref={ref}>
      <group ref={bobRef}>
        <primitive object={scene.clone()} scale={100} />
      </group>

      {/* Health bar — outside bob group so it stays level */}
      <mesh position={[0, 3.6, 0]}>
        <planeGeometry args={[1, 0.1]} />
        <meshBasicMaterial color="red" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-0.5 + (health / 100) * 0.5, 3.6, 0.01]}>
        <planeGeometry args={[health / 100, 0.08]} />
        <meshBasicMaterial color="limegreen" />
      </mesh>
    </group>
  )
}

useGLTF.preload('/models/chair_monster.glb')