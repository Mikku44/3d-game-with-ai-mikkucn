import { Debug } from '@react-three/cannon'
import Floor from './Floor'
import Obstacles from './Obstacles'
import Player from './Player'
import SmallWoodenBox from './SmallWoodenBox'
import Monster from './Monster'
import { useControls } from 'leva'
import { create } from 'zustand'
import { AnimationMixer } from 'three'
import Bathroom from './bathroom'
import SoundManager from './SoundManager'

export const useStore = create((set) => ({
  groundObjects: {},
  actions: {},
  mixer: new AnimationMixer(),
  playerPosition: [0, 0, 0],
  playerHealth: 100,
  playerMaxHealth: 100,
  showBoxOverlay: false,
  monsters: [],
  enemyCount: 1, // initial count
  showWinner: false,
  showItemShop: false,
  selectedWeapon: 'fists', // default weapon
    gameState: 'menu', // 'menu' | 'playing' | 'paused'
    setGameState: (state) => set({ gameState: state }),

     currentBoxModel: '/models/small_wooden_box/scene.gltf',
  setCurrentBoxModel: (modelPath) => set({ currentBoxModel: modelPath }),
  weaponAmmo: {
    fists: { current: null, reserve: null, max: null },

  },
  bossHealth: 100, // boss health for UI display
  bossMaxHealth: 100,
  addMonster: (ref) =>
    set((state) => ({
      monsters: [...state.monsters, ref],
    })),

  removeMonster: (ref) =>
    set((state) => ({
      monsters: state.monsters.filter((m) => m !== ref),
    })),
}))

function ToggleDebug({ children }) {
  const debugRendererVisible = useControls('Debug Renderer', { visible: false })

  return <>{debugRendererVisible.visible ? <Debug>{children}</Debug> : <>{children}</>}</>
}

export default function Game() {

  const { bossHealth } = useStore()

  return (
    <>
      <ToggleDebug >
        <SoundManager />
        <Bathroom position={[0, 0, 0]} />
        <Floor  />
        {/* <Obstacles /> */}
        <Player position={[0, 1, 0]} />
       
        <SmallWoodenBox position={[2, 0, 0]} />
        {Array(4).fill().map((_, i) => (
  <Monster 
    key={i} 
    position={[(Math.random() - 0.5) * 20, 1, (Math.random() - 0.5) * 20]} 
  />
))}

{/* <Monster 
    position={[(Math.random() - 0.5) * 20, 1, (Math.random() - 0.5) * 20]} 
  /> */}

      </ToggleDebug>
    </>
  )
}
