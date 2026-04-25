import { useStore } from "../Game"

export default function LossOverlay() {
  const playerHealth = useStore(s => s.playerHealth)

  if (playerHealth > 0) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.9)',
      zIndex: 3000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontFamily: 'monospace',
      letterSpacing: '4px'
    }}>
      <div style={{
        fontSize: '32px',
        marginBottom: '20px',
        textShadow: '0 0 20px rgba(255,255,255,0.5)'
      }}>
        YOU LOST
      </div>

      <button
        onClick={() => {
          // reset game state
          useStore.setState({
            playerHealth: useStore.getState().playerMaxHealth,
            bossHealth: useStore.getState().bossMaxHealth,
          })
          
          // 🔥 re-lock pointer for gameplay
          document.body.requestPointerLock?.()
        }}
        style={{
          padding: '10px 20px',
          background: 'white',
          color: 'black',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        RESTART
      </button>
    </div>
  )
}