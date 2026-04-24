import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import { LoopOnce, LoopRepeat } from 'three'
import * as THREE from 'three'
import { useStore } from './Game'
import { useContactMaterial } from '@react-three/cannon'

export default function Eve() {
  const ref = useRef()
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
    health: { damage: 0, range: 0 },
    armor: { damage: 0, range: 0 },
    boots: { damage: 0, range: 0 }
  }

  useContactMaterial('ground', 'slippery', {
    friction: 0,
    restitution: 0.01,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3
  })

  useEffect(() => {
    actions['idle'] = mixer.clipAction(idleAnimation[0], ref.current)
    actions['idle'].loop = LoopOnce
    actions['idle'].clampWhenFinished = true
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
      // left click = button 0
      // Right click = button 2
      if (e.button === 0 && document.pointerLockElement) {
        e.preventDefault()
        console.log('Punch triggered')
        if (actions['punch']) {
          actions['idle'].fadeOut(0.1)
          actions['punch'].reset().fadeIn(0.1).play()
          
          // Check for monsters within punch range
          const currentWeapon = weaponStats[selectedWeapon] || weaponStats.fists
          monsters.forEach(monsterRef => {
            if (monsterRef.current && monsterRef.current.visible !== false) {
              const monsterPos = monsterRef.current.position
              const distance = Math.sqrt(
                (playerPosition[0] - monsterPos.x) ** 2 +
                (playerPosition[1] - monsterPos.y) ** 2 +
                (playerPosition[2] - monsterPos.z) ** 2
              )
              if (distance < currentWeapon.range) { // weapon range
                monsterRef.current.takeDamage(currentWeapon.damage) // weapon damage
              }
            }
          })
          
          setTimeout(() => {
            actions['punch'].fadeOut(0.1)
            actions['idle'].reset().fadeIn(0.1).play()
          }, 600)
        }
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [actions, playerPosition, monsters, selectedWeapon])

  // Calculate and log the bounding box of the player model
  useEffect(() => {
    if (ref.current) {
      const box = new THREE.Box3().setFromObject(ref.current)
      const size = box.getSize(new THREE.Vector3())
      console.log('Player model dimensions:', {
        width: size.x,
        height: size.y,
        depth: size.z,
        boundingBox: box
      })
    }
  }, [])

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

useGLTF.preload(['/models/eve.glb', '/models/eve@idle.glb', '/models/eve@walking.glb', '/models/eve@jump.glb'])
