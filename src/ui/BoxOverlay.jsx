import { useGLTF } from "@react-three/drei"
import { useStore } from "../Game"
import { useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

function BoxOverlay() {
  const { showBoxOverlay, currentBoxModel } = useStore()
  const { scene } = useGLTF(currentBoxModel)
  const objectRef = useRef()

  useEffect(() => {
    if (showBoxOverlay) {
      document.exitPointerLock()
    }
  }, [showBoxOverlay])

  
  if (!showBoxOverlay) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#000000cc',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <button
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          border: 'none',
          background: 'rgba(0,0,0,0.0)',
          transform: 'translateX(-50%)',
          padding: '12px 28px',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'white',
          fontFamily: "'Courier New', monospace",
          letterSpacing: '1px',

          transition: 'all 0.2s ease',
          zIndex: 1001
        }}
        onClick={() => useStore.setState({ showBoxOverlay: false })}
        onMouseEnter={(e) => {
         
          e.target.style.transform = 'translateX(-50%) scale(1.05)'
        }}
        onMouseLeave={(e) => {
          
          e.target.style.transform = 'translateX(-50%) scale(1)'
        }}
      >
        BACK
      </button>
      
      <Canvas 
        style={{ 
          width: '100vw', 
          height: '100vh',
          position: 'absolute',
          top: 0,
          left: 0
        }}
        camera={{ 
          position: [2, 1, 3],
          fov: 45
        }}
      >
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />
        <directionalLight position={[0, 5, 0]} intensity={0.3} />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          zoomSpeed={1.5}
          rotateSpeed={1}
          target={[0, 0, 0]}
        />
        
        <primitive
          ref={objectRef}
          object={scene.clone()}
          scale={0.5}
          position={[0, 0, 0]}
         
        />
      </Canvas>
    </div>
  )
}

export default BoxOverlay