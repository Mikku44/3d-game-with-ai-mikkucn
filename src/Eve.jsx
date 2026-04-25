import { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { LoopOnce, LoopRepeat, Vector3, Box3, MathUtils } from 'three'
import { useStore } from './Game'
import { useContactMaterial } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'

export default function Eve({ yaw }) { // Pass yaw as a prop from PlayerCollider
  const ref = useRef()
  const isRightClick = useRef(false)
  const currentCamZ = useRef(0.5)

  const { nodes, materials } = useGLTF('/models/eve.glb')
  const idleAnimation = useGLTF('/models/eve@idle.glb').animations
  const walkAnimation = useGLTF('/models/eve@walking.glb').animations
  const jumpAnimation = useGLTF('/models/eve@jump.glb').animations
  const punchAnimation = useGLTF('/models/eve@jump.glb').animations

  const { actions, mixer, playerPosition, monsters, selectedWeapon } = useStore((state) => state)

  const weaponStats = {
    fists: { damage: 10, range: 2 },
    sword: { damage: 25, range: 2.5 },
    gun: { damage: 40, range: 10 },
  }

  useContactMaterial('ground', 'slippery', {
    friction: 0,
    restitution: 0.01,
  })

// Inside Eve.js
useFrame((state) => {
  const targetZ = isRightClick.current ? 0.2 : 0.5;
  currentCamZ.current = MathUtils.lerp(currentCamZ.current, targetZ, 0.1);

  // OPTION A: If your useFollowCam allows direct mutation (the previous attempt)
  if (yaw?.offset) {
    yaw.offset[2] = currentCamZ.current;
  }

  // OPTION B: Force update the camera's position relative to the group
  // This is a "manual" zoom override
  if (isRightClick.current || currentCamZ.current !== 0.5) {
     const camera = state.camera;
     // This assumes your followCam is using a pivot system
     // We adjust the camera's local Z position
     camera.position.z = currentCamZ.current;
  }
});

  useEffect(() => {
    actions['idle'] = mixer.clipAction(idleAnimation[0], ref.current)
    actions['idle'].loop = LoopRepeat // Changed to LoopRepeat for idle
    actions['walk'] = mixer.clipAction(walkAnimation[0], ref.current)
    actions['walk'].loop = LoopRepeat
    actions['jump'] = mixer.clipAction(jumpAnimation[0], ref.current)
    actions['jump'].loop = LoopOnce
    actions['jump'].clampWhenFinished = true
    actions['punch'] = mixer.clipAction(punchAnimation[0], ref.current)
    actions['punch'].loop = LoopOnce
    actions['punch'].clampWhenFinished = true

    actions['idle'].play()
  }, [actions, mixer, idleAnimation, walkAnimation, jumpAnimation, punchAnimation])

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (!document.pointerLockElement) return

      // Left Click: Punch
      if (e.button === 0) {
        if (actions['punch']) {
          actions['punch'].reset().fadeIn(0.2).play()
          const currentWeapon = weaponStats[selectedWeapon] || weaponStats.fists
          monsters.forEach(monsterRef => {
            if (monsterRef.current?.visible) {
              const mPos = monsterRef.current.position
              const dist = Math.sqrt((playerPosition[0] - mPos.x) ** 2 + (playerPosition[1] - mPos.y) ** 2 + (playerPosition[2] - mPos.z) ** 2)
              if (dist < currentWeapon.range) monsterRef.current.takeDamage(currentWeapon.damage)
            }
          })
        }
      }
      
      // Right Click: Zoom Start
      if (e.button === 2) {
        console.log("Zoom In")
        isRightClick.current = true
      }
    }

    const handleMouseUp = (e) => {
      if (e.button === 2) {
        console.log("Zoom Out")
        isRightClick.current = false
      }
    }

    const handleContextMenu = (e) => e.preventDefault()

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('contextmenu', handleContextMenu)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [actions, playerPosition, monsters, selectedWeapon])

  return (
    <group ref={ref} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={nodes.mixamorigHips} />
          <skinnedMesh castShadow name="Mesh" frustumCulled={false} geometry={nodes.Mesh.geometry} material={materials.SpacePirate_M} skeleton={nodes.Mesh.skeleton} />
        </group>
      </group>
    </group>
  )
}