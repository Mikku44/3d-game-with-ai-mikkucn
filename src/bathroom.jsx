import { useGLTF } from '@react-three/drei'
import { useBox } from '@react-three/cannon'

export default function Bathroom({ position = [0, 0, 0] }) {
  // Load the model
  const { scene } = useGLTF('/models/the_bathroom_free.glb')

  // Create a static physics box for the floor/base of the bathroom 
  // so the player doesn't fall through the model's floor
//   const [ref] = useBox(() => ({
//     type: 'Kinematic',
//     position,
//     args: [10, 0.1, 10], 
//   }))

  return (
    <group position={position}>
      <primitive object={scene} castShadow receiveShadow />
    </group>
  )
}

// Pre-load to avoid stuttering when the game starts
useGLTF.preload('/models/the_bathroom_free.glb')