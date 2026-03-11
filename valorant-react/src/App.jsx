import { useState } from 'react'
import { Analytics } from "@vercel/analytics/react"
import AgentTab from './pages/AgentTab/AgentTab'
import MapTab from './pages/MapTab/MapTab'

const TABS = [
  { key: 'agent', label: 'エージェント', component: <AgentTab /> },
  { key: 'map',   label: 'マップ',       component: <MapTab /> },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('agent')
  const current = TABS.find(t => t.key === activeTab)

  return (
    <>
      <header className="header">
        <div>
          <div className="header__logo">VAL<span>//</span>RANDOM</div>
          <div className="header__subtitle">VALORANT ランダムピック</div>
        </div>
        <div className="header__badge">React 18</div>
      </header>

      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn${activeTab === tab.key ? ' tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main>
        {current.component}
      </main>
      <Analytics />
    </>
  )
}
