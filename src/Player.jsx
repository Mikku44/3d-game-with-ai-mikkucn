import { Suspense, useMemo, useRef, useEffect } from 'react'
import { Vector3, Euler, Quaternion, Matrix4, MathUtils } from 'three'
import Eve from './Eve'
import { useCompoundBody } from '@react-three/cannon'
import useKeyboard from './useKeyboard'
import { useFrame } from '@react-three/fiber'
import { Vec3 } from 'cannon-es'
import useFollowCam from './useFollowCam'
import { useStore } from './Game'

// --- Audio System ---
const sounds = {
  walk: new Audio('/sounds/walk.mp3'),
  jump: new Audio('/sounds/jump.mp3'), // Ensure this exists
  zoom: new Audio('/sounds/zoom.mp3'),
}
sounds.walk.loop = true
sounds.walk.volume = 0.1

export default function PlayerCollider({ position }) {
  const playerGrounded = useRef(false)
  const inJumpAction = useRef(false)
  const group = useRef()
  const isRightClick = useRef(false)
  const currentCamZ = useRef(0.5)
  const isWalkingSoundPlaying = useRef(false) // Track sound state

  const { yaw } = useFollowCam(group, [0.2, 1.3, 0.5])
  const velocity = useMemo(() => new Vector3(), [])
  const inputVelocity = useMemo(() => new Vector3(), [])
  const euler = useMemo(() => new Euler(), [])
  const quat = useMemo(() => new Quaternion(), [])
  const targetQuaternion = useMemo(() => new Quaternion(), [])
  const worldPosition = useMemo(() => new Vector3(), [])
  const raycasterOffset = useMemo(() => new Vector3(), [])
  const contactNormal = useMemo(() => new Vec3(0, 0, 0), [])
  const down = useMemo(() => new Vec3(0, -1, 0), [])
  const rotationMatrix = useMemo(() => new Matrix4(), [])
  const prevActiveAction = useRef(0) 
  const keyboard = useKeyboard()

  const { groundObjects, actions, mixer } = useStore((state) => state)

  // Zoom Sound Logic
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.button === 2) {
        isRightClick.current = true
        sounds.zoom.currentTime = 0
        sounds.zoom.play().catch(() => {})
      }
    }
    const handleMouseUp = (e) => {
      if (e.button === 2) {
        isRightClick.current = false
        sounds.zoom.currentTime = 0
        sounds.zoom.play().catch(() => {})
      }
    }
    const handleContextMenu = (e) => e.preventDefault()

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('contextmenu', handleContextMenu)
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('contextmenu', handleContextMenu)
      sounds.walk.pause()
    }
  }, [])

  const [ref, body] = useCompoundBody(
    () => ({
      mass: 1,
      shapes: [
        { args: [0.25], position: [0, 0.25, 0], type: 'Sphere' },
        { args: [0.25], position: [0, 0.75, 0], type: 'Sphere' },
        { args: [0.25], position: [0, 1.25, 0], type: 'Sphere' }
      ],
      onCollide: (e) => {
        if (e.contact.bi.id !== e.body.id) {
          contactNormal.set(...e.contact.ni)
        }
        if (contactNormal.dot(down) > 0.5) {
          if (inJumpAction.current) {
            inJumpAction.current = false
            actions['jump'].fadeOut(0.3)
            actions['idle'].reset().fadeIn(0.3).play()
          }
        }
      },
      material: 'slippery',
      linearDamping: 0,
      position: position
    }),
    useRef()
  )

  useFrame(({ raycaster }, delta) => {
    let activeAction = 0 // 0:idle, 1:walking, 2:jumping

    // Smooth Zoom
    const targetZ = isRightClick.current ? 0.2 : 0.5
    currentCamZ.current = MathUtils.lerp(currentCamZ.current, targetZ, 0.1)
    if (yaw.offset) yaw.offset[2] = currentCamZ.current

    body.angularFactor.set(0, 0, 0)
    ref.current.getWorldPosition(worldPosition)
    useStore.setState({ playerPosition: worldPosition.toArray() })

    // Ground Check
    playerGrounded.current = false
    raycasterOffset.copy(worldPosition)
    raycasterOffset.y += 0.01
    raycaster.set(raycasterOffset, down)
    raycaster.intersectObjects(Object.values(groundObjects), false).forEach((i) => {
      if (i.distance < 0.021) playerGrounded.current = true
    })

    if (!playerGrounded.current) {
      body.linearDamping.set(0)
    } else {
      body.linearDamping.set(0.9999999)
    }

    // Rotation Logic
    const distance = worldPosition.distanceTo(group.current.position)
    rotationMatrix.lookAt(worldPosition, group.current.position, group.current.up)
    targetQuaternion.setFromRotationMatrix(rotationMatrix)
    if (distance > 0.0001 && !group.current.quaternion.equals(targetQuaternion)) {
      targetQuaternion.z = 0; targetQuaternion.x = 0; targetQuaternion.normalize()
      group.current.quaternion.rotateTowards(targetQuaternion, delta * 20)
    }

    if (document.pointerLockElement) {
      inputVelocity.set(0, 0, 0)
      
      // Movement Detection
      const isMoving = keyboard['KeyW'] || keyboard['KeyS'] || keyboard['KeyA'] || keyboard['KeyD']
      
      if (playerGrounded.current) {
        if (isMoving) {
          activeAction = 1
          if (keyboard['KeyW']) inputVelocity.z = -1
          if (keyboard['KeyS']) inputVelocity.z = 1
          if (keyboard['KeyA']) inputVelocity.x = -1
          if (keyboard['KeyD']) inputVelocity.x = 1
        }
      }

      // --- WALK SOUND LOGIC ---
      if (activeAction === 1 && playerGrounded.current) {
        if (!isWalkingSoundPlaying.current) {
          sounds.walk.play().catch(() => {})
          isWalkingSoundPlaying.current = true
        }
      } else {
        if (isWalkingSoundPlaying.current) {
          sounds.walk.pause()
          isWalkingSoundPlaying.current = false
        }
      }

      inputVelocity.setLength(delta * (keyboard['ShiftLeft'] || keyboard['ShiftRight'] ? 42 : 40))

      // Action Transitions
      if (activeAction !== prevActiveAction.current) {
        if (prevActiveAction.current !== 1 && activeAction === 1) {
          actions['idle'].fadeOut(0.3)
          actions['walk'].reset().fadeIn(0.3).play()
        }
        if (prevActiveAction.current !== 0 && activeAction === 0) {
          actions['walk'].fadeOut(0.3)
          actions['idle'].reset().fadeIn(0.3).play()
        }
        prevActiveAction.current = activeAction
      }

      // --- JUMP SOUND LOGIC ---
      if (keyboard['Space']) {
        if (playerGrounded.current && !inJumpAction.current) {
          activeAction = 2
          inJumpAction.current = true
          
          // Play Jump SFX
          sounds.jump.currentTime = 0
          sounds.jump.play().catch(() => {})

          actions['walk'].fadeOut(0.3)
          actions['idle'].fadeOut(0.3)
          actions['jump'].reset().fadeIn(0.3).play()
          inputVelocity.y = 6
        }
      }

      euler.y = yaw.rotation.y
      quat.setFromEuler(euler)
      inputVelocity.applyQuaternion(quat)
      velocity.set(inputVelocity.x, inputVelocity.y, inputVelocity.z)
      body.applyImpulse([velocity.x, velocity.y, velocity.z], [0, 0, 0])
    }

    // Mixer Updates
    if (activeAction === 1) {
      const isRunning = keyboard['ShiftLeft'] || keyboard['ShiftRight']
      mixer.update(distance / (isRunning ? 1.5 : 3))
    } else {
      mixer.update(delta)
    }

    group.current.position.lerp(worldPosition, 0.3)
  })

  return (
    <>
      <group ref={group} position={position}>
        <Suspense fallback={null}>
          <Eve yaw={yaw} />
        </Suspense>
      </group>
    </>
  )
}