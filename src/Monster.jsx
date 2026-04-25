import { useRef, useEffect, useMemo, Suspense } from 'react'
import { useCompoundBody } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Vector3, MathUtils } from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { useStore } from './Game'

function MannequinModel({ speedScale, isDead, scene, animations }) {
  const group = useRef()
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    const action = actions[animations[0]?.name]
    if (!action) return

    if (isDead) {
      action.fadeOut(0.5)
    } else {
      action.reset().fadeIn(0.5).play()
      action.setEffectiveTimeScale(speedScale)
    }
    return () => action?.stop()
  }, [actions, animations, speedScale, isDead])

  return (
    <group ref={group} dispose={null}>
      <primitive object={clone} />
    </group>
  )
}

export default function Monster({ position, isPreview = false }) {
  const visualRef = useRef()
  const worldPos = useMemo(() => new Vector3(), [])
  const velocity = useRef([0, 0, 0])
  
  // Ref to track attack timing (cooldown)
  const lastAttackTime = useRef(0)
  const attackCooldown = 1.0 // seconds between attacks
  const attackDamage = 10
  const attackRange = 1.5

  const { playerPosition, monsters, bossHealth } = useStore()
  const isDead = bossHealth <= 0
  const speed = useMemo(() => 0.8 + Math.random() * 1.5, []) 
  const scale = 2.2

  const [ref, api] = useCompoundBody(() => ({
    mass: 5,
    position,
    fixedRotation: true, // IMPORTANT: Prevents the monster from falling over like a domino
    shapes: [
      { 
        type: 'Cylinder', 
        args: [0.6 , 0.6 * scale, 2, 8 * scale], // [radiusTop, radiusBottom, height, segments]
        position: [0, 1, 0],    // Centered horizontally (0,0), raised to cover body height
      },
    ],
  }), [scale])

  useEffect(() => api.velocity.subscribe(v => (velocity.current = v)), [api])

  // Register monster and damage logic
  useEffect(() => {
    if (isPreview) return
    
    ref.current.takeDamage = (amount) => {
      if (isDead) return
      useStore.setState((state) => ({ bossHealth: Math.max(0, state.bossHealth - amount) }))
    }

    monsters.push(ref)
    return () => {
      const i = monsters.indexOf(ref)
      if (i > -1) monsters.splice(i, 1)
    }
  }, [ref, monsters, isPreview, isDead])

  useFrame((state, delta) => {
    if (isPreview || !ref.current || isDead) {
      if (isDead && velocity.current[1] > -1) api.velocity.set(0, -2, 0)
      return
    }

    ref.current.getWorldPosition(worldPos)

    // Calculate distance to player
    const dx = playerPosition[0] - worldPos.x
    const dz = playerPosition[2] - worldPos.z
    const dist = Math.sqrt(dx * dx + dz * dz)

    // 1. ATTACK LOGIC
    if (dist <= attackRange) {
      const currentTime = state.clock.getElapsedTime()
      
      if (currentTime - lastAttackTime.current > attackCooldown) {
        // Apply damage to store
        useStore.setState((s) => ({ 
          playerHealth: Math.max(0, s.playerHealth - attackDamage) 
        }))
        
        console.log("Player damaged! Current Health:", useStore.getState().playerHealth)
        lastAttackTime.current = currentTime
      }
      
      // Stop moving while in attack range
      api.velocity.set(0, velocity.current[1], 0)

    } 
    // 2. MOVEMENT LOGIC
    else if (dist > 1.2) {
      const targetVx = (dx / dist) * speed
      const targetVz = (dz / dist) * speed
      
      api.velocity.set(targetVx, velocity.current[1], targetVz)

      // Rotate to face the movement direction
      if (visualRef.current) {
        const targetAngle = Math.atan2(dx, dz)
        visualRef.current.rotation.y = MathUtils.lerp(
          visualRef.current.rotation.y,
          targetAngle,
          5 * delta 
        )
      }
    } else {
      api.velocity.set(0, velocity.current[1], 0)
    }
  })

  const { scene, animations } = useGLTF('/models/manniquin/Low Crawl.glb')

  return (
    <group ref={ref}>
      <group ref={visualRef} scale={scale}>
        <Suspense fallback={null}>
          {!isDead && (
            <MannequinModel 
              scene={scene} 
              animations={animations} 
              speedScale={speed / 2} 
              isDead={isDead} 
            />
          )}
        </Suspense>
      </group>
    </group>
  )
}

useGLTF.preload('/models/manniquin/Low Crawl.glb')