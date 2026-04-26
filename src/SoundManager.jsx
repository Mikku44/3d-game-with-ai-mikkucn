import { useEffect, useState } from 'react'
import { useStore } from './Game'

export default function SoundManager() {
  const gameState = useStore((state) => state.gameState)
  const [bgMusic] = useState(() => new Audio('/sounds/dragon-studio-dark-horror-ambient-05-425468.mp3'))

  useEffect(() => {
    bgMusic.loop = true
    bgMusic.volume = 0.4

    if (gameState === 'playing') {
      bgMusic.play().catch(() => console.log("Audio waiting for user interaction"))
    } else {
      bgMusic.pause()
    }
    
    return () => bgMusic.pause()
  }, [gameState, bgMusic])

  return null
}