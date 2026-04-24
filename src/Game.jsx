import { Debug } from '@react-three/cannon'
import Floor from './Floor'
import Obstacles from './Obstacles'
import Player from './Player'
import SmallWoodenBox from './SmallWoodenBox'
import Monster from './Monster'
import { useControls } from 'leva'
import { create } from 'zustand'
import { AnimationMixer } from 'three'

export const useStore = create(() => ({
  groundObjects: {},
  actions: {},
  mixer: new AnimationMixer(),
  playerPosition: [0, 0, 0],
  showBoxOverlay: false,
  monsters: [],
  enemyCount: 1, // initial count
  showWinner: false,
  showItemShop: false,
  selectedWeapon: 'gun', // default weapon
  weaponAmmo: {
    gun: { current: 2, reserve: 9, max: 9 },
    sword: { current: null, reserve: null, max: null },
    fists: { current: null, reserve: null, max: null },
    health: { current: null, reserve: null, max: null },
    armor: { current: null, reserve: null, max: null },
    boots: { current: null, reserve: null, max: null }
  },
  bossHealth: 100, // boss health for UI display
  bossMaxHealth: 100
}))

function ToggleDebug({ children }) {
  const debugRendererVisible = useControls('Debug Renderer', { visible: false })

  return <>{debugRendererVisible.visible ? <Debug>{children}</Debug> : <>{children}</>}</>
}

export default function Game() {
  return (
    <>
      <ToggleDebug >
        <Floor  />
        {/* <Obstacles /> */}
        <Player position={[0, 1, 0]} />
        <SmallWoodenBox position={[2, 0, 0]} />
        <Monster position={[0, 1, 8]} />
      </ToggleDebug>
    </>
  )
}
