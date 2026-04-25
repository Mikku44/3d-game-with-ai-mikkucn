import { useState, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'

// Main UI Component for Rotating Model
export function ModelRotationUI({ modelRef, initialRotation = [0, 0, 0] }) {
  const [rotationY, setRotationY] = useState(initialRotation[1])
  const [rotationX, setRotationX] = useState(initialRotation[0])
  const [rotationZ, setRotationZ] = useState(initialRotation[2])
  const [isRotating, setIsRotating] = useState(false)
  const [activeAxis, setActiveAxis] = useState(null)
  
  // Touch/click drag rotation
  const dragStartPos = useRef({ x: 0, y: 0 })
  const dragStartRot = useRef({ x: 0, y: 0 })
  
  useEffect(() => {
    if (modelRef?.current) {
      modelRef.current.rotation.set(rotationX, rotationY, rotationZ)
    }
  }, [rotationX, rotationY, rotationZ, modelRef])
  
  const handleDragStart = (e, axis) => {
    e.preventDefault()
    setIsRotating(true)
    setActiveAxis(axis)
    dragStartPos.current = {
      x: e.clientX || e.touches?.[0]?.clientX,
      y: e.clientY || e.touches?.[0]?.clientY
    }
    dragStartRot.current = {
      x: rotationX,
      y: rotationY
    }
  }
  
  const handleDragMove = (e) => {
    if (!isRotating) return
    
    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY
    const deltaX = (clientX - dragStartPos.current.x) * 0.5
    const deltaY = (clientY - dragStartPos.current.y) * 0.5
    
    if (activeAxis === 'horizontal') {
      setRotationY(dragStartRot.current.y + deltaX)
    } else if (activeAxis === 'vertical') {
      setRotationX(Math.min(Math.max(dragStartRot.current.x + deltaY, -Math.PI / 2), Math.PI / 2))
    } else if (activeAxis === 'free') {
      setRotationY(dragStartRot.current.y + deltaX)
      setRotationX(Math.min(Math.max(dragStartRot.current.x + deltaY, -Math.PI / 2), Math.PI / 2))
    }
  }
  
  const handleDragEnd = () => {
    setIsRotating(false)
    setActiveAxis(null)
  }
  
  useEffect(() => {
    window.addEventListener('mousemove', handleDragMove)
    window.addEventListener('mouseup', handleDragEnd)
    window.addEventListener('touchmove', handleDragMove)
    window.addEventListener('touchend', handleDragEnd)
    
    return () => {
      window.removeEventListener('mousemove', handleDragMove)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('touchmove', handleDragMove)
      window.removeEventListener('touchend', handleDragEnd)
    }
  }, [isRotating, activeAxis])
  
  const resetRotation = () => {
    setRotationX(0)
    setRotationY(0)
    setRotationZ(0)
  }
  
  const rotateBy = (axis, degrees) => {
    const rad = degrees * (Math.PI / 180)
    if (axis === 'x') setRotationX(prev => prev + rad)
    if (axis === 'y') setRotationY(prev => prev + rad)
    if (axis === 'z') setRotationZ(prev => prev + rad)
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '15px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000,
      minWidth: '250px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '14px' }}>
        🎮 Model Rotation Controls
      </div>
      
      {/* Drag Control */}
      <div style={{ marginBottom: '15px', textAlign: 'center' }}>
        <div style={{
          width: '100%',
          height: '120px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          userSelect: 'none',
          marginBottom: '10px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
        onMouseDown={(e) => handleDragStart(e, 'free')}
        onTouchStart={(e) => handleDragStart(e, 'free')}
        >
          <div style={{ fontSize: '32px', marginBottom: '5px' }}>🖱️</div>
          <div style={{ fontSize: '12px' }}>Drag to Rotate (Free)</div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{
            flex: 1,
            height: '60px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'ew-resize',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
          onMouseDown={(e) => handleDragStart(e, 'horizontal')}
          onTouchStart={(e) => handleDragStart(e, 'horizontal')}
          >
            <div style={{ fontSize: '20px' }}>↔️</div>
            <div style={{ fontSize: '10px' }}>Horizontal</div>
          </div>
          
          <div style={{
            flex: 1,
            height: '60px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'ns-resize',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
          onMouseDown={(e) => handleDragStart(e, 'vertical')}
          onTouchStart={(e) => handleDragStart(e, 'vertical')}
          >
            <div style={{ fontSize: '20px' }}>↕️</div>
            <div style={{ fontSize: '10px' }}>Vertical</div>
          </div>
        </div>
      </div>
      
      {/* Slider Controls */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>
          🔄 Y-Axis Rotation (Horizontal): {(rotationY * (180 / Math.PI)).toFixed(0)}°
        </label>
        <input
          type="range"
          min="-180"
          max="180"
          value={rotationY * (180 / Math.PI)}
          onChange={(e) => setRotationY(e.target.value * (Math.PI / 180))}
          style={{
            width: '100%',
            cursor: 'pointer',
            backgroundColor: '#4CAF50',
            height: '4px',
            borderRadius: '2px'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>
          📐 X-Axis Rotation (Vertical): {(rotationX * (180 / Math.PI)).toFixed(0)}°
        </label>
        <input
          type="range"
          min="-90"
          max="90"
          value={rotationX * (180 / Math.PI)}
          onChange={(e) => setRotationX(e.target.value * (Math.PI / 180))}
          style={{
            width: '100%',
            cursor: 'pointer',
            backgroundColor: '#2196F3',
            height: '4px',
            borderRadius: '2px'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>
          ⚙️ Z-Axis Rotation: {(rotationZ * (180 / Math.PI)).toFixed(0)}°
        </label>
        <input
          type="range"
          min="-180"
          max="180"
          value={rotationZ * (180 / Math.PI)}
          onChange={(e) => setRotationZ(e.target.value * (Math.PI / 180))}
          style={{
            width: '100%',
            cursor: 'pointer',
            backgroundColor: '#FF9800',
            height: '4px',
            borderRadius: '2px'
          }}
        />
      </div>
      
      {/* Button Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
        <button onClick={() => rotateBy('x', -15)} style={buttonStyle}>↖ X-</button>
        <button onClick={() => rotateBy('y', -15)} style={buttonStyle}>← Y-</button>
        <button onClick={() => rotateBy('y', 15)} style={buttonStyle}>Y+ →</button>
        <button onClick={() => rotateBy('x', 15)} style={buttonStyle}>X+ ↗</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
        <button onClick={() => rotateBy('z', -15)} style={{...buttonStyle, backgroundColor: '#FF9800'}}>⟳ Z-</button>
        <button onClick={() => rotateBy('z', 15)} style={{...buttonStyle, backgroundColor: '#FF9800'}}>Z+ ⟲</button>
      </div>
      
      <button onClick={resetRotation} style={{
        width: '100%',
        padding: '8px',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
        marginTop: '5px'
      }}>
        🔄 Reset Rotation
      </button>
      
      <div style={{ fontSize: '10px', marginTop: '10px', textAlign: 'center', color: '#aaa' }}>
        Current: X:{rotationX.toFixed(2)} | Y:{rotationY.toFixed(2)} | Z:{rotationZ.toFixed(2)}
      </div>
    </div>
  )
}

const buttonStyle = {
  padding: '8px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold',
  transition: 'all 0.2s'
}

// Alternative: 3D Orbital Controls UI
export function OrbitalControlsUI({ modelRef, onRotate }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const presets = [
    { name: 'Front', rotation: [0, 0, 0] },
    { name: 'Back', rotation: [0, Math.PI, 0] },
    { name: 'Left', rotation: [0, -Math.PI / 2, 0] },
    { name: 'Right', rotation: [0, Math.PI / 2, 0] },
    { name: 'Top', rotation: [-Math.PI / 2, 0, 0] },
    { name: 'Bottom', rotation: [Math.PI / 2, 0, 0] },
    { name: 'Isometric', rotation: [-0.615, 0.785, 0] },
  ]
  
  const applyPreset = (rotation) => {
    if (modelRef?.current) {
      modelRef.current.rotation.set(rotation[0], rotation[1], rotation[2])
      if (onRotate) onRotate(rotation)
    }
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: isExpanded ? '15px' : '10px',
      zIndex: 1000,
      transition: 'all 0.3s'
    }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          border: 'none',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        🎮
      </button>
      
      {isExpanded && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '12px', marginBottom: '8px', fontWeight: 'bold' }}>
            View Presets
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px' }}>
            {presets.map((preset, i) => (
              <button
                key={i}
                onClick={() => applyPreset(preset.rotation)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#333',
                  color: 'white',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// How to use in your Monster component:
export function MonsterWithRotationUI({ position }) {
  const modelRef = useRef()
  
  return (
    <>
      <group ref={modelRef} position={position}>
        <Monster position={[0, 0, 0]} />
      </group>
      
      {/* Add UI as HTML overlay */}
      <Html fullscreen>
        <ModelRotationUI modelRef={modelRef} />
      </Html>
    </>
  )
}