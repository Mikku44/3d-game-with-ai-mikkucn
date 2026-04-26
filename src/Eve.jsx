import { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { LoopOnce, LoopRepeat, MathUtils } from 'three'
import { useStore } from './Game'
import { useContactMaterial } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'

// --- Audio Setup ---
const sounds = {
  walk: new Audio('/sounds/walk.mp3'),
  damage: new Audio('/sounds/damage.mp3'),
  zoom: new Audio('/sounds/zoom.mp3'),
  attack: new Audio('/sounds/attack.mp3'),
  jump: new Audio('/sounds/jump.mp3'), // Fixed path from your snippet
}

sounds.walk.loop = true
sounds.walk.volume = 0.1
sounds.damage.volume = 0.1
sounds.zoom.volume = 0.1
sounds.attack.volume = 0.1
sounds.jump.volume = 0.1

export default function Eve({ yaw }) {
  const ref = useRef()
  const isRightClick = useRef(false)
  const currentCamZ = useRef(0.5)
  const isWalkingSoundPlaying = useRef(false)

  // Load Models & Animations
  const { nodes, materials } = useGLTF('/models/eve.glb')
  const idleAnimation = useGLTF('/models/eve@idle.glb').animations
  const walkAnimation = useGLTF('/models/eve@walking.glb').animations
  const jumpAnimation = useGLTF('/models/eve@jump.glb').animations
  const punchAnimation = useGLTF('/models/eve@jump.glb').animations

  const { 
    actions, 
    mixer, 
    playerPosition, 
    monsters, 
    selectedWeapon, 
    playerHealth 
  } = useStore()

  const weaponStats = {
    fists: { damage: 10, range: 2 },
    sword: { damage: 25, range: 2.5 },
    gun: { damage: 40, range: 10 },
  }

  useContactMaterial('ground', 'slippery', {
    friction: 0,
    restitution: 0.01,
  })

  // --- 1. Damage Sound Trigger ---
  useEffect(() => {
    if (playerHealth < 100 && playerHealth > 0) {
      sounds.damage.currentTime = 0
      sounds.damage.play().catch(() => {})
    }
  }, [playerHealth])

  // --- 2. Frame Loop: Zoom & Walking Sound ---
  useFrame((state) => {
    // Camera Zoom
    const targetZ = isRightClick.current ? 0.2 : 0.5
    currentCamZ.current = MathUtils.lerp(currentCamZ.current, targetZ, 0.1)

    if (yaw?.offset) {
      yaw.offset[2] = currentCamZ.current
    } else {
      state.camera.position.z = currentCamZ.current
    }

    // Walking Sound Logic - More robust check
    const walkAction = actions['walk']
    // We check if it's running AND if the weight is significant (to avoid sound during tiny micro-movements)
    if (walkAction && walkAction.isRunning() && walkAction.getEffectiveWeight() > 0.5) {
      if (!isWalkingSoundPlaying.current) {
        sounds.walk.currentTime = 0 // Start from beginning
        sounds.walk.play().catch(() => {})
        isWalkingSoundPlaying.current = true
      }
    } else {
      if (isWalkingSoundPlaying.current) {
        sounds.walk.pause()
        isWalkingSoundPlaying.current = false
      }
    }
  })

  // --- 3. Animation Initialization ---
  useEffect(() => {
    if (!ref.current) return
    
    actions['idle'] = mixer.clipAction(idleAnimation[0], ref.current)
    actions['walk'] = mixer.clipAction(walkAnimation[0], ref.current)
    actions['jump'] = mixer.clipAction(jumpAnimation[0], ref.current)
    actions['punch'] = mixer.clipAction(punchAnimation[0], ref.current)

    actions['idle'].setLoop(LoopRepeat).play()
    actions['walk'].setLoop(LoopRepeat)
    actions['jump'].setLoop(LoopOnce).clampWhenFinished = true
    actions['punch'].setLoop(LoopOnce).clampWhenFinished = true
  }, [actions, mixer, idleAnimation, walkAnimation, jumpAnimation, punchAnimation])

  // --- 4. Input Handlers (SFX Integrated) ---
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (!document.pointerLockElement) return

      // Left Click: Attack
      if (e.button === 0) {
        if (actions['punch']) {
          // Play Attack SFX
          sounds.attack.currentTime = 0
          sounds.attack.play().catch(() => {})
          
          actions['punch'].reset().fadeIn(0.1).play()
          const currentWeapon = weaponStats[selectedWeapon] || weaponStats.fists
          
          monsters.forEach(monsterRef => {
            if (monsterRef.current?.visible) {
              const mPos = monsterRef.current.position
              const dist = Math.sqrt(
                (playerPosition[0] - mPos.x) ** 2 + 
                (playerPosition[1] - mPos.y) ** 2 + 
                (playerPosition[2] - mPos.z) ** 2
              )
              if (dist < currentWeapon.range) monsterRef.current.takeDamage(currentWeapon.damage)
            }
          })
        }
      }
      
      // Right Click: Zoom In
      if (e.button === 2) {
        isRightClick.current = true
        sounds.zoom.currentTime = 0
        sounds.zoom.play().catch(() => {})
      }
    }

    const handleMouseUp = (e) => {
      if (e.button === 2) {
        isRightClick.current = false
        // Optional: play zoom sound for zoom out too
        sounds.zoom.currentTime = 0
        sounds.zoom.play().catch(() => {})
      }
    }

    const handleKeyDown = (e) => {
        if (e.code === 'Space') {
            sounds.jump.currentTime = 0
            sounds.jump.play().catch(() => {})
        }
    }

    const handleContextMenu = (e) => e.preventDefault()

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)
    
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
      sounds.walk.pause()
    }
  }, [actions, playerPosition, monsters, selectedWeapon])

  return (
    <group ref={ref} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={nodes.mixamorigHips} />
          <skinnedMesh 
            castShadow 
            name="Mesh" 
            frustumCulled={false} 
            geometry={nodes.Mesh.geometry} 
            material={materials.SpacePirate_M} 
            skeleton={nodes.Mesh.skeleton} 
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/eve.glb')
useGLTF.preload('/models/eve@idle.glb')
useGLTF.preload('/models/eve@walking.glb')
useGLTF.preload('/models/eve@jump.glb')