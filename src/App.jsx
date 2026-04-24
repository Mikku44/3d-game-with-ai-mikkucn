import { Canvas } from '@react-three/fiber'
import { Stats, useProgress, Html, OrbitControls } from '@react-three/drei'
import Game from './Game'
import { Physics } from '@react-three/cannon'
import { Suspense, useState, useEffect, useRef } from 'react'
import { useStore } from './Game'
import { useGLTF } from '@react-three/drei'

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

function WinnerOverlay() {
  const { showWinner } = useStore()

  if (!showWinner) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.9)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '48px',
      fontWeight: 'bold'
    }}>
      <div>🎉 YOU WIN! 🎉</div>
      <div style={{ fontSize: '24px', marginTop: '20px' }}>
        All enemies defeated!
      </div>
      <button
        style={{
          marginTop: '40px',
          padding: '15px 30px',
          fontSize: '20px',
          background: 'green',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer'
        }}
        onClick={() => window.location.reload()}
      >
        Play Again
      </button>
    </div>
  )
}

function WeaponHUD() {
  const { selectedWeapon, weaponAmmo } = useStore()
  const weaponMap = {
    fists: { icon: '👊', label: 'Melee', color: '#ffffff' },
    sword: { icon: '⚔️', label: 'Blade', color: '#f8f8f2' },
    gun: { icon: '🔫', label: 'Pistol', color: '#a7ffba' }
  }
  const weapon = weaponMap[selectedWeapon] || weaponMap.fists
  const ammo = weaponAmmo[selectedWeapon] || { current: 0, reserve: 0, max: 1 }
  const fill = ammo.max ? Math.max(0, Math.min(100, (ammo.current / ammo.max) * 100)) : 0

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '260px',
      height: '132px',
      padding: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(10, 10, 15, 0.85)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '18px',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 16px 40px rgba(0,0,0,0.45)',
      color: 'white',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '24px'
          }}>
            {weapon.icon}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#9ea6b8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              Primary
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>
              {weapon.label}
            </div>
          </div>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${fill}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #00ff90, #00cabb)',
            transition: 'width 0.2s ease'
          }} />
        </div>
      </div>
      <div style={{ position: 'relative', width: '108px', height: '108px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `conic-gradient(rgba(0,255,144,0.85) ${fill * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
          filter: 'blur(1px)'
        }} />
        <div style={{
          position: 'absolute',
          inset: '8px',
          borderRadius: '50%',
          background: 'rgba(10, 10, 15, 0.95)',
          border: '1px solid rgba(255,255,255,0.14)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{ammo.current ?? 0}</div>
          <div style={{ fontSize: '14px', color: '#9ea6b8' }}>/ {ammo.reserve ?? 0}</div>
          <div style={{ marginTop: '6px', fontSize: '10px', letterSpacing: '0.2em', color: '#7a8a9b' }}>AMMO</div>
        </div>
      </div>
    </div>
  )
}

function ItemShop() {
  const { showItemShop, selectedWeapon } = useStore()



  if (!showItemShop) return null

  const items = [
    { id: 'fists', name: 'Fists', price: 0, damage: 10, emoji: '👊', category: 'melee' },
    { id: 'sword', name: 'Sword', price: 500, damage: 25, emoji: '⚔️', category: 'melee' },
    { id: 'gun', name: 'Pistol', price: 800, damage: 40, emoji: '🔫', category: 'ranged' },
    { id: 'health', name: 'Health Potion', price: 300, damage: 0, emoji: '🧪', category: 'consumable' },
    { id: 'armor', name: 'Armor', price: 600, damage: 0, emoji: '🛡️', category: 'defense' },
    { id: 'boots', name: 'Speed Boots', price: 400, damage: 0, emoji: '👢', category: 'utility' }
  ]

  const selectItem = (itemId) => {
    useStore.setState({ selectedWeapon: itemId })
    console.log(`Selected ${itemId}`)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      height: '300px',
      background: 'rgba(20, 20, 30, 0.95)',
      border: '2px solid #ff4655',
      borderRadius: '10px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        padding: '10px',
        background: '#ff4655',
        borderRadius: '8px 8px 0 0',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        ITEM SHOP
      </div>
      
      <div style={{
        flex: 1,
        padding: '10px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        overflowY: 'auto'
      }}>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => selectItem(item.id)}
            style={{
              background: selectedWeapon === item.id ? '#ff4655' : 'rgba(40, 40, 50, 0.8)',
              border: selectedWeapon === item.id ? '2px solid #ffffff' : '1px solid #666',
              borderRadius: '5px',
              padding: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '70px'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{item.emoji}</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>{item.name}</div>
            <div style={{ fontSize: '10px', color: '#ff4655' }}>${item.price}</div>
            {item.damage > 0 && <div style={{ fontSize: '10px', color: '#ffff00' }}>DMG: {item.damage}</div>}
          </div>
        ))}
      </div>
      
      <div style={{
        padding: '8px',
        background: 'rgba(30, 30, 40, 0.9)',
        borderRadius: '0 0 8px 8px',
        textAlign: 'center',
        fontSize: '12px'
      }}>
        Press 'B' to toggle shop • Selected: {items.find(i => i.id === selectedWeapon)?.name}
      </div>
    </div>
  )
}

export default function App() {
  const { enemyCount, selectedWeapon, bossHealth, bossMaxHealth } = useStore()

  const weaponEmojis = {
    fists: '👊',
    sword: '⚔️',
    gun: '🔫',
    health: '🧪',
    armor: '🛡️',
    boots: '👢'
  }

  const weaponOrder = ['fists', 'sword', 'gun'] // Weapons to cycle through

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'KeyB') {
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
      <div id="instructions">
        WASD to move
        <br />
        SHIFT to run
        <br />
        SPACE to jump
        <br />
        Right-click to punch
        <br />
        Mouse wheel to switch weapons
        <br />
        B to open item shop
        <br />
        Model from{' '}
        <a href="https://www.mixamo.com" target="_blank" rel="nofollow noreferrer">
          Mixamo
        </a>
      </div>
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          padding: '15px 20px',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          minWidth: '300px'
        }}
      >
        <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
          BOSS HEALTH
        </div>
        <div style={{
          width: '100%',
          height: '20px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{
            width: `${(bossHealth / bossMaxHealth) * 100}%`,
            height: '100%',
            background: bossHealth > 50 ? 'linear-gradient(90deg, #00ff00, #00cc00)' : 
                       bossHealth > 25 ? 'linear-gradient(90deg, #ffff00, #ffcc00)' : 
                       'linear-gradient(90deg, #ff0000, #cc0000)',
            transition: 'width 0.3s ease, background 0.3s ease'
          }} />
        </div>
        <div style={{ color: 'white', fontSize: '14px' }}>
          {bossHealth}/{bossMaxHealth} HP
        </div>
      </div>
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
      <WinnerOverlay />
      <ItemShop />
      <Canvas shadows onPointerDown={(e) => e.target.requestPointerLock()}>
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.3} />
          <spotLight position={[2.5, 5, 5]} angle={Math.PI / 3} penumbra={0.5} castShadow shadow-mapSize-height={2048} shadow-mapSize-width={2048} intensity={Math.PI * 75} />
          <spotLight position={[-2.5, 5, 5]} angle={Math.PI / 3} penumbra={0.5} castShadow shadow-mapSize-height={2048} shadow-mapSize-width={2048} intensity={Math.PI * 75} />
          <spotLight position={[0, 8, 0]} angle={Math.PI / 4} penumbra={0.3} castShadow shadow-mapSize-height={2048} shadow-mapSize-width={2048} intensity={Math.PI * 50} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />
          <Physics>
            <Game />
          </Physics>
          <Stats />
        </Suspense>
      </Canvas>
    </>
  )
}
