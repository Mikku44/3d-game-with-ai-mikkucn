import { useEffect, useRef } from 'react'
import { useStore } from '../Game'

function WinOverlay() {
  const { bossHealth, bossMaxHealth } = useStore()
  const containerRef = useRef()

  const isWin = bossHealth <= 0

  // 🔓 unlock pointer on win
  useEffect(() => {
    if (isWin) {
      document.exitPointerLock()
    }
  }, [isWin])

  // 🎬 auto scroll
  useEffect(() => {
    if (!isWin || !containerRef.current) return

    const el = containerRef.current
    let start = null

    function animate(ts) {
      if (!start) start = ts
      const progress = ts - start

      // scroll speed
      el.scrollTop = progress * 0.05

      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [isWin])

  if (!isWin) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'black',
      color: 'white',
      zIndex: 4000,
      overflow: 'hidden',
      fontFamily: 'monospace'
    }}>
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'absolute',
          bottom: '-100%',
          width: '100%',
          textAlign: 'center',
          lineHeight: '2',
          letterSpacing: '3px'
        }}>
          <h1 style={{ marginBottom: '80px' }}>MISSION COMPLETE</h1>

          <p>—</p>
          <p>YOU SURVIVED</p>
          <p>THE FINAL ENCOUNTER</p>
          <p>—</p>

          <br /><br />

          <p>GAME DESIGN</p>
          <p>MIKKU CN</p>

          <br />

          <p>DEVELOPMENT</p>
          <p>MIKKU CN</p>

          <br />

          <p>3D MODELS</p>
          <p>Mixamo</p>

          <br />

          <p>POWERED BY</p>
          <p>React Three Fiber</p>

          <br /><br />

          <p>THANK YOU FOR PLAYING</p>

          <div style={{ marginTop: '120px' }}>
            <button
              onClick={() => {
                useStore.setState({
                  playerHealth: useStore.getState().playerMaxHealth,
                  bossHealth: useStore.getState().bossMaxHealth,
                })

                document.body.requestPointerLock?.()
              }}
              style={{
                padding: '10px 20px',
                background: 'white',
                color: 'black',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              RESTART
            </button>
          </div>

          <div style={{ height: '300px' }} />
        </div>
      </div>
    </div>
  )
}

export default WinOverlay