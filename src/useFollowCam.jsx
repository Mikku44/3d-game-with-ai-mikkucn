import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { Object3D, Vector3, MathUtils } from 'three'

export default function useFollowCam(ref, offset = [0, 2, 3]) {
  const { scene, camera } = useThree()

  const pivot = useMemo(() => new Object3D(), [])
  const alt = useMemo(() => new Object3D(), [])
  const yaw = useMemo(() => new Object3D(), [])
  const pitch = useMemo(() => new Object3D(), [])
  const worldPosition = useMemo(() => new Vector3(), [])

  // 🎮 settings (tweak here)
  const sensitivity = 0.0025
  const minPitch = -Math.PI / 2      // look down
  const maxPitch = Math.PI / 3       // look up more
  const followSpeed = 5

  function onDocumentMouseMove(e) {
    if (!document.pointerLockElement) return

    e.preventDefault()

    // 🧭 horizontal (yaw)
    yaw.rotation.y -= e.movementX * sensitivity

    // 🎯 vertical (pitch)
    const nextPitch = pitch.rotation.x - e.movementY * sensitivity

    // clamp
    const clamped = Math.max(minPitch, Math.min(maxPitch, nextPitch))

    // smooth
    pitch.rotation.x = MathUtils.lerp(pitch.rotation.x, clamped, 0.5)
  }

  function onDocumentMouseWheel(e) {
    if (!document.pointerLockElement) return

    e.preventDefault()

    const nextZ = camera.position.z + e.deltaY * 0.005

    // zoom limits
    camera.position.z = MathUtils.clamp(nextZ, 0.5, 6)
  }

  useEffect(() => {
    // 🧱 build camera rig
    scene.add(pivot)

    pivot.add(alt)
    alt.position.y = offset[1]

    alt.add(yaw)
    yaw.add(pitch)
    pitch.add(camera)

    camera.position.set(offset[0], 0, offset[2])

    // 🎮 controls
    document.addEventListener('mousemove', onDocumentMouseMove)
    document.addEventListener('wheel', onDocumentMouseWheel, { passive: false })

    return () => {
      document.removeEventListener('mousemove', onDocumentMouseMove)
      document.removeEventListener('wheel', onDocumentMouseWheel)
    }
  }, [camera])

  useFrame((_, delta) => {
    if (!ref.current) return

    // follow player smoothly
    ref.current.getWorldPosition(worldPosition)

    pivot.position.lerp(worldPosition, delta * followSpeed)
  })

  return { pivot, alt, yaw, pitch }
}