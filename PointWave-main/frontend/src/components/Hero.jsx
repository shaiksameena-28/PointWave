import { useState } from 'react'
import HeroVisual from './HeroVisual'

function Hero({ onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchMessage, setSearchMessage] = useState('')

  const handleSearch = () => {
    const value = searchTerm.trim()
    if (!value) {
      setSearchMessage('Tell us what you need help with.')
      return
    }
    if (onNavigate) {
      onNavigate(`/find-work?search=${encodeURIComponent(value)}`)
      return
    }
    setSearchMessage(`We’ll help you explore “${value}”.`)
  }

  const handlePopularSearch = (category) => {
    setSearchTerm(category)
    setSearchMessage('')
  }

  return (
    <section className="hero" id="top">
      <div className="hero-content">
        <p className="hero-label">A better way to freelance</p>
        <h1>Work with the <span>right</span> people.</h1>
        <p className="hero-description">
          Find projects that fit your skills, or find people who can bring your project to life.
        </p>
        <div className="hero-search">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
            placeholder="Search projects, skills or talent"
            aria-label="Search projects, skills or talent"
          />
          <button className="search-button" type="button" onClick={handleSearch}>Search</button>
        </div>
        {searchMessage && <p className="search-message" aria-live="polite">{searchMessage}</p>}
        <div className="popular-searches">
          <span>Try</span>
          {['Web development', 'UI/UX design', 'Biotechnology', 'Marketing'].map((item) => (
            <button type="button" key={item} onClick={() => handlePopularSearch(item)}>{item}</button>
          ))}
        </div>
      </div>
      <div className="hero-visual" data-spotlight>
        <HeroVisual />
      </div>
    </section>
  )
}

export default Hero
