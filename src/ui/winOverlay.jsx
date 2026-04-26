import { useEffect, useState ,useMemo} from 'react'
import { motion, AnimatePresence } from 'framer-motion' 
import { useStore } from '../Game'

export default function WinOverlay() {
  const { bossHealth, bossMaxHealth, playerMaxHealth } = useStore()
  const isWin = bossHealth <= 0

   const winAudio = useMemo(() => {
      if (typeof Audio !== 'undefined') {
        const audio = new Audio('/sounds/win.mp3')
        audio.volume = 0.5
        return audio
      }
      return null
    }, [])

  useEffect(() => {
    if (isWin) {
      winAudio?.play().catch(() => {})
      document.exitPointerLock?.()
    }
  }, [isWin, winAudio])

  return (
    <AnimatePresence>
      {isWin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'black',
            color: 'white',
            zIndex: 4000,
            fontFamily: 'monospace',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {/* Scrolling Content */}
          <motion.div
            initial={{ y: '100vh' }}
            animate={{ y: '-100%' }}
            transition={{ 
              duration: 25, // Adjust speed here (higher = slower)
              ease: "linear",
              delay: 1 // Wait for the fade-in before starting scroll
            }}
            style={{
              position: 'absolute',
              textAlign: 'center',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '60px',
              paddingTop: '50px'
            }}
          >
            <h1 style={{ fontSize: '3rem', letterSpacing: '10px' }}>MISSION COMPLETE</h1>
            
            <section>
              <p style={{ color: '#888' }}>— STATUS —</p>
              <p>YOU SURVIVED THE BATHROOM</p>
            </section>

            <section>
              <p style={{ color: '#888' }}>DESIGN & DEV</p>
              <p>MIKKU CN</p>
            </section>

            <section>
              <p style={{ color: '#888' }}>ASSETS</p>
              <p>The Bathroom Free (GLB)</p>
              <p>Mixamo Animations</p>
            </section>

            <section>
              <p style={{ color: '#888' }}>ENGINE</p>
              <p>React Three Fiber + Cannon</p>
            </section>

            <div style={{ height: '100px' }} />
            
            <h2>THANK YOU FOR PLAYING</h2>

            {/* Restart Button */}
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'white', color: 'black' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                useStore.setState({
                  playerHealth: playerMaxHealth,
                  bossHealth: bossMaxHealth,
                  gameState: 'playing'
                })
                document.body.requestPointerLock?.()
              }}
              style={{
                alignSelf: 'center',
                padding: '12px 30px',
                background: 'transparent',
                color: 'white',
                border: '1px solid white',
                cursor: 'pointer',
                fontSize: '1rem',
                marginTop: '40px'
              }}
            >
              RESTART SIMULATION
            </motion.button>
            
            <div style={{ height: '200px' }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}