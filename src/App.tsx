import { TamagotchiModule } from './ui/modules/tamagotchi/TamagotchiModule'
import { WalletModule } from './ui/modules/wallet/WalletModule'
import './App.css'

function App() {
  return (
    <div className="app">
      <WalletModule />
      <TamagotchiModule />
    </div>
  )
}

export default App


