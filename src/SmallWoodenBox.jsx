import { useGLTF } from '@react-three/drei'
import { useBox } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useState, useRef } from 'react'
import { useStore } from './Game'
import useKeyboard from './useKeyboard'

export default function SmallWoodenBox(props) {
  const { scene } = useGLTF('/models/small_wooden_box/scene.gltf')
  const [ref] = useBox(() => ({ mass: 0, args: [0.476, 0.162, 0.348], ...props }))
  const { playerPosition, showBoxOverlay } = useStore()
  const keyboard = useKeyboard()
  const lastEPress = useRef(false)

  useFrame(() => {
    const distance = Math.sqrt(
      (playerPosition[0] - props.position[0]) ** 2 +
      (playerPosition[1] - props.position[1]) ** 2 +
      (playerPosition[2] - props.position[2]) ** 2
    )
    const isClose = distance < 2 // within 2 units
    const ePressed = keyboard['KeyE']

    if (isClose && ePressed && !lastEPress.current) {
      useStore.setState({ showBoxOverlay: !showBoxOverlay })
    }
    lastEPress.current = ePressed
  })

  return (
    <group>
      <primitive ref={ref} object={scene.clone()} scale={0.1} />
    </group>
  )
}

useGLTF.preload('/models/small_wooden_box/scene.gltf')