import { TamagotchiModule } from './ui/modules/tamagotchi/TamagotchiModule'
import './App.css'

function App() {
  return (
    <div className="app">
      {/* TODO: WalletModule будет добавлен позже */}
      <div className="app__wallet-placeholder">
        <p>Wallet Module (будет добавлен позже)</p>
      </div>
      
      <TamagotchiModule />
    </div>
  )
}

export default App


