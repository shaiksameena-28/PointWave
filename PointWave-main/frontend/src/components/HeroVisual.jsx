import { useState } from 'react'

function HeroVisual() {
  const [mode, setMode] = useState('work')

  return (
    <div className={`hero-visual-canvas ${mode === 'hire' ? 'hero-visual-hire' : ''}`}>
      <div className="hero-visual-topline">
        <span>PointWave / live view</span>
        <span className="visual-status"><i /> Exploring</span>
      </div>

      <div className="hero-mode-toggle" role="group" aria-label="Choose a starting view">
        <button type="button" className={mode === 'work' ? 'active' : ''} onClick={() => setMode('work')}>
          Find work
        </button>
        <button type="button" className={mode === 'hire' ? 'active' : ''} onClick={() => setMode('hire')}>
          Hire talent
        </button>
      </div>

      <div className="hero-wave" aria-hidden="true">
        <span className="wave-dot dot-one" />
        <span className="wave-dot dot-two" />
        <span className="wave-dot dot-three" />
        <svg viewBox="0 0 420 190" preserveAspectRatio="none">
          <path d="M8 126 C76 42, 125 168, 202 88 S330 48, 412 116" />
        </svg>
      </div>

      <div className="hero-visual-copy">
        <span className="visual-index">0{mode === 'work' ? '1' : '2'}</span>
        <h3>{mode === 'work' ? 'Find work that makes sense.' : 'Find people who make sense.'}</h3>
        <p>{mode === 'work' ? 'Skills, availability and evidence come first.' : 'Project needs, evidence and trust come first.'}</p>
      </div>

      <div className="hero-float-tags">
        <span>{mode === 'work' ? 'Relevant projects' : 'Relevant talent'}</span>
        <span>{mode === 'work' ? 'Your skills' : 'Project needs'}</span>
        <span>Clear signals</span>
      </div>
    </div>
  )
}

export default HeroVisual
