import { Canvas } from '@react-three/fiber'
import { Stats, useProgress, Html, OrbitControls } from '@react-three/drei'
import Game from './Game'
import { Physics } from '@react-three/cannon'
import { Suspense, useState, useEffect, useRef } from 'react'
import { useStore } from './Game'
import { useGLTF } from '@react-three/drei'
import LossOverlay from './ui/LossOverlay'
import WinOverlay from './ui/winOverlay'
import MenuScreen from './ui/MenuScreen'

function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress} % loaded</Html>
}

function BoxOverlay() {
  const { scene } = useGLTF('/models/small_wooden_box/scene.gltf')
  const { showBoxOverlay } = useStore()
  const objectRef = useRef()

  useEffect(() => {
    if (showBoxOverlay) {
      document.exitPointerLock()
    }
  }, [showBoxOverlay])

  const handlePointerOver = () => {
    if (objectRef.current) {
      objectRef.current.traverse((child) => {
        if (child.material) {
          child.material.emissive.set(0.2, 0.2, 0.2)
        }
      })
    }
  }

  const handlePointerOut = () => {
    if (objectRef.current) {
      objectRef.current.traverse((child) => {
        if (child.material) {
          child.material.emissive.set(0, 0, 0)
        }
      })
    }
  }

  if (!showBoxOverlay) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.8)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <button
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px'
        }}
        onClick={() => useStore.setState({ showBoxOverlay: false })}
      >
        Back
      </button>
      <Canvas style={{ width: '50vw', height: '50vh' }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <OrbitControls enablePan={false} enableZoom={true} />
        <primitive
          ref={objectRef}
          object={scene.clone()}
          scale={0.5}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
      </Canvas>
    </div>
  )
}





function VitalCurve({ healthPercent }) {
  const canvasRef = useRef()
  const frameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrame

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Dynamic settings based on health
      const isLow = healthPercent < 30
      const color = isLow ? '#ff4444' : '#ffffff'
      const speed = isLow ? 0.15 : 0.08 // Heart beats faster when health is low
      
      frameRef.current += speed

      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = color
      ctx.shadowBlur = 8
      ctx.shadowColor = color

      for (let x = 0; x < canvas.width; x++) {
        // Base sine wave
        let y = Math.sin(x * 0.05 + frameRef.current) * 10
        
        // Add a "heartbeat" spike every now and then
        if ((x + Math.floor(frameRef.current * 10)) % 100 < 10) {
          y -= Math.sin(x * 0.5) * 20 
        }

        if (x === 0) ctx.moveTo(x, 25 + y)
        else ctx.lineTo(x, 25 + y)
      }

      ctx.stroke()
      animationFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationFrame)
  }, [healthPercent])

  return (
    <canvas 
      ref={canvasRef} 
      width="180" 
      height="50" 
      style={{ opacity: 0.8, marginBottom: '-10px' }} 
    />
  )
}

function WeaponHUD() {
  const { 
    selectedWeapon, 
    weaponAmmo, 
    playerHealth, 
    playerMaxHealth 
  } = useStore()

  const weaponMap = {
    fists: { label: 'MELEE' },
    sword: { label: 'BLADE' },
    gun: { label: 'PISTOL' },
  }
  
  const weapon = weaponMap[selectedWeapon] || weaponMap.fists
  const ammo = weaponAmmo[selectedWeapon] || { current: 0, reserve: 0, max: 1 }
  const healthPercent = Math.max(0, (playerHealth / playerMaxHealth) * 100)

  return (
    <div style={{
      position: 'fixed',
      bottom: '40px',
      right: '40px',
      color: 'white',
      fontFamily: 'monospace',
      zIndex: 1000,
      textAlign: 'right',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      
      {/* --- PLAYER HEALTH SECTION (WITH CANVAS CURVE) --- */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '10px', letterSpacing: '3px', opacity: 0.6, marginBottom: '4px' }}>
          VITAL SIGNS
        </div>
        
        {/* Animated Curve Canvas */}
        <VitalCurve healthPercent={healthPercent} />

        {/* Minimal Progress Bar */}
        <div style={{
          width: '180px',
          height: '4px',
          background: 'rgba(255,255,255,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${healthPercent}%`,
            height: '100%',
            background: healthPercent < 30 ? '#ff4444' : 'white',
            transition: 'width 0.4s ease-out',
            boxShadow: healthPercent < 30 ? '0 0 10px #ff4444' : '0 0 10px white'
          }} />
        </div>
        
        <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
          {playerHealth} <span style={{ opacity: 0.4 }}>/ {playerMaxHealth} HP</span>
        </div>
      </div>

      {/* --- WEAPON & AMMO SECTION --- */}
      <div>
        <div style={{ fontSize: '10px', letterSpacing: '3px', opacity: 0.6, marginBottom: '4px' }}>
          {weapon.label}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '8px' }}>
          <span style={{ fontSize: '48px', fontWeight: '200', lineHeight: '1' }}>
            {ammo.current ?? 0}
          </span>
          <span style={{ fontSize: '18px', opacity: 0.4 }}>
            / {ammo.reserve ?? 0}
          </span>
        </div>
        
        <div style={{
          width: '120px',
          height: '2px',
          background: 'rgba(255,255,255,0.2)',
          marginTop: '8px',
          marginLeft: 'auto'
        }}>
          <div style={{
            width: `${Math.min(100, (ammo.current / ammo.max) * 100)}%`,
            height: '100%',
            background: 'white',
            boxShadow: '0 0 10px white'
          }} />
        </div>
      </div>
    </div>
  )
}
function ItemShop() {
  const { showItemShop, selectedWeapon } = useStore()
  if (!showItemShop) return null

  const items = [
    { id: 'fists', name: 'MELEE', price: 0 },
    { id: 'sword', name: 'BLADE', price: 500 },
    { id: 'gun', name: 'PISTOL', price: 800 },
    { id: 'health', name: 'RECOVERY', price: 300 },
    { id: 'armor', name: 'VEST', price: 600 },
    { id: 'boots', name: 'SPEED', price: 400 }
  ]

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ width: '600px', borderTop: '1px solid white', borderBottom: '1px solid white', padding: '40px 0' }}>
        <div style={{ color: 'white', letterSpacing: '8px', textAlign: 'center', marginBottom: '30px', fontSize: '12px' }}>
          SUPPLIES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.1)' }}>
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => useStore.setState({ selectedWeapon: item.id })}
              style={{
                padding: '20px',
                background: selectedWeapon === item.id ? 'white' : 'black',
                color: selectedWeapon === item.id ? 'black' : 'white',
                cursor: 'pointer',
                textAlign: 'center',
                transition: '0.2s',
                fontFamily: 'monospace'
              }}
            >
              <div style={{ fontSize: '11px', letterSpacing: '2px' }}>{item.name}</div>
              <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '5px' }}>${item.price}</div>
            </div>
          ))}
        </div>
        <div style={{ color: 'white', fontSize: '9px', textAlign: 'center', marginTop: '20px', opacity: 0.5, letterSpacing: '2px' }}>
          PRESS 'B' TO RETURN TO COMBAT
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { enemyCount, 
    selectedWeapon, 
    bossHealth, 
    bossMaxHealth,
    gameState,
    playerHealth,
    playerMaxHealth } = useStore()



  const weaponOrder = ['fists', 'sword', 'gun'] 

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'KeyB') {
        return;
        const { showItemShop } = useStore.getState()
        useStore.setState({ showItemShop: !showItemShop })
      }
    }

    const handleWheel = (e) => {
      // Only switch weapons if not in item shop and not in pointer lock
      if (!useStore.getState().showItemShop && !document.pointerLockElement) {
        e.preventDefault()
        const currentIndex = weaponOrder.indexOf(selectedWeapon)
        let newIndex
        
        if (e.deltaY > 0) {
          // Scroll down - next weapon
          newIndex = (currentIndex + 1) % weaponOrder.length
        } else {
          // Scroll up - previous weapon
          newIndex = currentIndex === 0 ? weaponOrder.length - 1 : currentIndex - 1
        }
        
        const newWeapon = weaponOrder[newIndex]
        useStore.setState({ selectedWeapon: newWeapon })
        console.log(`Switched to ${newWeapon}`)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    document.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      document.removeEventListener('wheel', handleWheel)
    }
  }, [selectedWeapon])

  return (
    <>
      <div
      style={{
        position:"absolute",
        left: "0px"
      }}
      className='relative left-0 '
      id="instructions">
        WASD to move
        <br />
        SHIFT to run
        <br />
        SPACE to jump
        <br />
        Right-click to punch
        <br />
        B to open item shop
        <br />
        Model from{' '}
        <a href="https://www.mixamo.com" target="_blank" rel="nofollow noreferrer">
          Mixamo
        </a>
      </div>
       {/* Boss Health - Ultra Minimal White Design */}
    <div style={{
      position: 'fixed',
      zIndex: 1000,
      top: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      minWidth: '400px'
    }}>
      <div style={{ 
        color: 'white', 
        fontSize: '12px', 
        letterSpacing: '4px', 
        fontWeight: '300',
        textShadow: '0 0 10px rgba(255,255,255,0.5)' 
      }}>
        THREAT LEVEL: CRITICAL
      </div>
      
      <div style={{
        width: '100%',
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        position: 'relative'
      }}>
        {/* Main Health Bar */}
        <div style={{
          width: `${(bossHealth / bossMaxHealth) * 100}%`,
          height: '100%',
          background: '#fff',
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 15px rgba(255,255,255,0.6)'
        }} />
        
        {/* Minimal Tick Marks */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.2) 25%)',
          backgroundSize: '25% 100%'
        }} />
      </div>
        
      <div style={{ 
        color: 'white', 
        fontSize: '10px', 
        fontFamily: 'monospace',
        opacity: 0.8 
      }}>
        {bossHealth} / {bossMaxHealth}
      </div>
    </div>
      <LossOverlay />
      <WinOverlay />
      <WeaponHUD />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '20px',
          height: '20px',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '0',
            width: '100%',
            height: '2px',
            background: 'white',
            transform: 'translateY(-50%)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '50%',
            width: '2px',
            height: '100%',
            background: 'white',
            transform: 'translateX(-50%)'
          }}
        />
      </div>
      <Suspense fallback={<div>Loading overlay...</div>}>
        <BoxOverlay />
      </Suspense>

      <MenuScreen />
  
      <ItemShop />
      <Canvas shadows onPointerDown={(e) => e.target.requestPointerLock()}>
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.3} />
          <spotLight position={[2.5, 5, 5]} angle={Math.PI / 3} penumbra={0.5} castShadow shadow-mapSize-height={2048} shadow-mapSize-width={2048} intensity={Math.PI * 75} />
          <spotLight position={[-2.5, 5, 5]} angle={Math.PI / 3} penumbra={0.5} castShadow shadow-mapSize-height={2048} shadow-mapSize-width={2048} intensity={Math.PI * 75} />
          <spotLight position={[0, 8, 0]} angle={Math.PI / 4} penumbra={0.3} castShadow shadow-mapSize-height={2048} shadow-mapSize-width={2048} intensity={Math.PI * 50} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />
          <Physics
            paused={gameState !== 'playing'}
            gravity={[0, -30, 0]}
            defaultContactMaterial={{
              friction: 0.1,
              restitution: 0.3,
            }}
            material={{
              ground: { friction: 0.4, restitution: 0.3 },
              slippery: { friction: 0.02, restitution: 0.8 },
              monster: { friction: 0.1, restitution: 0.4 },
            }}
          >
            <Game />
          </Physics>
          <Stats />
        </Suspense>
      </Canvas>
    </>
  )
}
