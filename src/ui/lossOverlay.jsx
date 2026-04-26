import { useStore } from "../Game"
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LossOverlay() {
  const playerHealth = useStore(s => s.playerHealth)
  const isDead = playerHealth <= 0

  // 🔊 Sound Effect
  useEffect(() => {
    if (isDead) {
      const audio = new Audio('/sounds/lose.mp3')
      audio.volume = 0.6
      audio.play().catch(() => {})
      document.exitPointerLock?.()
    }
  }, [isDead])

  return (
    <AnimatePresence>
      {isDead && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'radial-gradient(circle, rgba(40,0,0,0.4) 0%, rgba(0,0,0,0.9) 100%)',
            zIndex: 6000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: '"Times New Roman", serif', // More cinematic
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Main "DEATH" Text (Sekiro Style) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            style={{
              fontSize: '120px',
              fontWeight: '900',
              color: '#9e0000', // Deep blood red
              textShadow: '0 0 30px rgba(0,0,0,1)',
              letterSpacing: '20px',
              position: 'relative',
              textAlign: 'center'
            }}
          >
            死
            <div style={{
              fontSize: '24px',
              letterSpacing: '15px',
              color: '#d10000',
              marginTop: '-20px',
              fontFamily: 'monospace'
            }}>
              DEATH
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.5 }}
            style={{
              color: 'white',
              marginTop: '40px',
              letterSpacing: '5px',
              fontSize: '12px',
              textTransform: 'uppercase'
            }}
          >
            The thread has been severed.
          </motion.p>

          {/* Restart Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
            onMouseEnter={(e) => {
                const hover = new Audio('/sound/trick.mp3');
                hover.volume = 0.2;
                hover.play().catch(() => {});
            }}
            onClick={() => {
              useStore.setState({
                playerHealth: useStore.getState().playerMaxHealth,
                bossHealth: useStore.getState().bossMaxHealth,
              })
              document.body.requestPointerLock?.()
            }}
            style={{
              marginTop: '60px',
              padding: '12px 40px',
              background: 'transparent',
              color: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              fontSize: '14px',
              letterSpacing: '4px',
              transition: 'all 0.3s'
            }}
          >
            RESURRECT
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}