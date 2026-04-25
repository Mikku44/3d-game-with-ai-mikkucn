import { useStore } from "../Game"
import { useState } from 'react'

export default function MenuScreen() {
  const gameState = useStore(s => s.gameState)
  const setGameState = useStore(s => s.setGameState)
  const [isHovered, setIsHovered] = useState(false)

  if (gameState !== 'menu') return null

  // Styles defined as objects for your current setup
  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(circle, rgba(20,20,20,0.8) 0%, rgba(0,0,0,0.95) 100%)',
      color: 'white',
      zIndex: 5000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '"Courier New", Courier, monospace',
      backdropFilter: 'blur(4px)',
    },
    title: {
      fontSize: '4rem',
      fontWeight: 'bold',
      margin: '0 0 60px 0',
      letterSpacing: '12px',
      textTransform: 'uppercase',
      textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
      textAlign: 'center'
    },
    button: {
      background: isHovered ? 'white' : 'transparent',
      color: isHovered ? 'black' : 'white',
      border: '2px solid white',
      padding: '16px 48px',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      letterSpacing: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      boxShadow: isHovered ? '0 0 30px rgba(255,255,255,0.4)' : 'none',
    },
    controls: {
      marginTop: '40px',
      fontSize: '0.8rem',
      opacity: 0.5,
      letterSpacing: '2px'
    }
  }

  return (
    <div style={styles.overlay}>
      {/* Background Decor (Optional) */}
      <div style={{ position: 'absolute', width: '100%', height: '2px', background: 'rgba(255,255,255,0.1)', top: '20%' }} />
      <div style={{ position: 'absolute', width: '100%', height: '2px', background: 'rgba(255,255,255,0.1)', bottom: '20%' }} />

      <h1 style={styles.title}>Final Thread</h1>

      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          setGameState('playing')
          document.body.requestPointerLock?.()
        }}
        style={styles.button}
      >
        INITIATE
      </button>

      <div style={styles.controls}>
        WASD TO MOVE | CLICK TO ATTACK
      </div>
    </div>
  )
}