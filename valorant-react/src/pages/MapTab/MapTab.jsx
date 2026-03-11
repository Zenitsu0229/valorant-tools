import { useState } from 'react'
import { MAPS } from '../../constants/maps'
import './MapTab.css'

const initMaps = () => MAPS.map(m => ({ ...m, excluded: false }))

export default function MapTab() {
  const [maps, setMaps]         = useState(initMaps)
  const [result, setResult]     = useState(null)
  const [resultKey, setResultKey] = useState(0)
  const [error, setError]       = useState('')

  const toggleMap = (name) => {
    setMaps(prev => prev.map(m => m.name === name ? { ...m, excluded: !m.excluded } : m))
  }

  const rollMap = () => {
    setError('')
    const pool = maps.filter(m => !m.excluded)
    if (pool.length === 0) {
      setError('マップを1つ以上残してください')
      return
    }
    setResult(pool[Math.floor(Math.random() * pool.length)])
    setResultKey(k => k + 1)
  }

  return (
    <div>
      <div className="section-title">マップ ランダム選択</div>
      <div className="section-desc">
        除外するマップをタップして、残りからランダムに1つ選びます
      </div>

      {/* マップ選択 */}
      <div className="card">
        <div className="input-label" style={{ marginBottom: 12 }}>
          除外するマップ（タップで除外）
        </div>
        <div className="map-grid">
          {maps.map(map => (
            <div
              key={map.name}
              className={`map-chip${map.excluded ? ' map-chip--excluded' : ''}`}
              onClick={() => toggleMap(map.name)}
            >
              {map.name}
            </div>
          ))}
        </div>
      </div>

      {error && <div className="notice">{error}</div>}

      <button className="btn-primary" onClick={rollMap}>
        🎯 マップをランダムに選ぶ
      </button>

      {/* 結果 */}
      {result && (
        <div className="result-area">
          <div className="result-title">— 結果 —</div>
          <div className="map-result-big" key={resultKey}>
            <div className="map-result-big__label">TODAY'S MAP</div>
            <div className="map-result-big__name">{result.name}</div>
            <div className="map-result-big__sub">{result.sub}</div>
          </div>
        </div>
      )}
    </div>
  )
}
