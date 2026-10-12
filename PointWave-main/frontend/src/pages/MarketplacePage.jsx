import { useEffect, useMemo, useRef, useState } from 'react'

const projects = [
  { id: 'market-react-site', title: 'Build a React product website', client: 'Northstar Labs', budget: '₹25,000–₹40,000', time: '2–3 weeks', skills: ['React', 'UI/UX', 'JavaScript'], type: 'Web development', description: 'Build a polished marketing and product website with responsive layouts and reusable components.' },
  { id: 'market-biotech-presentation', title: 'Biotech research presentation design', client: 'Helix Labs', budget: '₹8,000–₹15,000', time: '5–7 days', skills: ['PowerPoint', 'Research', 'Biology'], type: 'Presentation design', description: 'Turn technical research into a clear, visual presentation for an upcoming research review.' },
  { id: 'market-science-videos', title: 'Edit short-form science videos', client: 'Nova Media', budget: '₹12,000–₹22,000', time: '1–2 weeks', skills: ['Video editing', 'YouTube', 'After Effects'], type: 'Video editing', description: 'Create a batch of concise educational videos with captions, pacing and clean visual treatment.' },
  { id: 'market-python-data', title: 'Python data cleaning workflow', client: 'Verde Analytics', budget: '₹18,000–₹30,000', time: '1–2 weeks', skills: ['Python', 'Data analysis', 'Pandas'], type: 'Data & software', description: 'Clean and structure recurring research datasets and document a repeatable workflow.' },
  { id: 'market-health-copy', title: 'Landing page copy for a health startup', client: 'Luma Health', budget: '₹6,000–₹12,000', time: '4–6 days', skills: ['Writing', 'Copywriting', 'Health tech'], type: 'Writing', description: 'Write clear landing page copy for a health product with a strong focus on trust and conversion.' },
]

function readClientProjects() {
  try { return JSON.parse(localStorage.getItem('pointwave-client-projects') || '[]') } catch { return [] }
}

function readApplications() {
  try { return JSON.parse(localStorage.getItem('pointwave-applications') || '[]') } catch { return [] }
}

function saveApplications(value) {
  localStorage.setItem('pointwave-applications', JSON.stringify(value))
}

const talent = [
  { id:'aarav-mehta', name: 'Aarav Mehta', title: 'Full-stack developer', skills: ['React', 'Node', 'PostgreSQL'], rating: '4.9', projects: 28 },
  { id:'maya-rao', name: 'Maya Rao', title: 'Product designer', skills: ['Figma', 'UI/UX', 'Research'], rating: '4.9', projects: 19 },
  { id:'ishaan-verma', name: 'Ishaan Verma', title: 'Video editor', skills: ['Premiere', 'After Effects', 'YouTube'], rating: '4.8', projects: 31 },
  { id:'sara-thomas', name: 'Sara Thomas', title: 'Research & technical writer', skills: ['Research', 'Writing', 'Biotech'], rating: '5.0', projects: 14 },
]

const pageContent = {
  '/find-work': { eyebrow: 'Find work', title: 'Projects worth applying to.', description: 'Discover work based on skills, project fit, budget and timing — not who can bid the loudest.' },
  '/find-talent': { eyebrow: 'Find talent', title: 'People who can actually do the work.', description: 'Explore freelancers through skills, portfolios, project history, availability and useful trust signals.' },
  '/services': { eyebrow: 'Services', title: 'Start with something ready to go.', description: 'Choose a focused service when you already know what you need, then refine the scope with the person you hire.' },
  '/how-it-works': { eyebrow: 'How it works', title: 'A clearer path from fit to finished work.', description: 'PointWave keeps the project at the center — from requirements and matching through milestones, delivery and reputation.' },
}

function MarketplacePage({ path, user, onNavigate, onSignup }) {
  const content = pageContent[path] ?? pageContent['/find-work']
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('search') || '')
  const [type, setType] = useState('All work')
  const [selected, setSelected] = useState(null)
  const openProjectsRef = useRef(null)
  const searchRef = useRef(null)
  const profile = useMemo(() => { try { return JSON.parse(localStorage.getItem('pointwave-profile') || '{}') } catch { return {} } }, [])
  const userSkills = (profile.skills || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  useEffect(() => {
    const initialSearch = new URLSearchParams(window.location.search).get('search') || ''
    if (initialSearch) {
      setQuery(initialSearch)
      requestAnimationFrame(() => openProjectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }, [path])

  if (path === '/find-work' && user?.role === 'freelancer') {
    const clientProjects = readClientProjects().map((project) => ({
      id: project.id,
      title: project.title,
      client: project.client || 'PointWave client',
      budget: project.budget,
      time: project.timeline,
      skills: project.skills || [],
      type: project.category || 'Client project',
      description: project.description,
      source: 'client',
    }))
    const availableProjects = [...clientProjects, ...projects]
    const filtered = availableProjects.filter((project) => {
      const haystack = `${project.title} ${project.description} ${project.skills.join(' ')} ${project.type}`.toLowerCase()
      const queryMatch = !query.trim() || haystack.includes(query.toLowerCase())
      const typeMatch = type === 'All work' || project.type === type || project.source === 'client' && type === 'All work'
      return queryMatch && typeMatch
    })
    const recommended = availableProjects.map((project) => ({ ...project, score: project.skills.filter((skill) => userSkills.includes(skill.toLowerCase())).length })).sort((a, b) => b.score - a.score).slice(0, 3)
    const submitSearch = (event) => {
      event?.preventDefault()
      requestAnimationFrame(() => openProjectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
    return <main className="marketplace-work-page">
      <section className="work-intro work-intro-compact"><div><p className="section-label">Find work</p><h1>What kind of work are you looking for?</h1><p>Search by the work itself, then use your profile evidence to decide what is worth applying to.</p></div></section>
      <form className="work-search" onSubmit={submitSearch}><div className="search-field"><input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects, skills or outcomes" aria-label="Search projects, skills or outcomes" /><button type="button" className="search-icon-button" aria-label="Search projects" onClick={submitSearch}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/></svg></button></div><select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter work type"><option>All work</option><option>Web development</option><option>Presentation design</option><option>Video editing</option><option>Data & software</option><option>Writing</option></select></form>
      <section className="recommended-section"><div className="market-heading"><div><p className="section-label">Recommended for you</p><h2>Start with these.</h2></div><span>{userSkills.length ? `Based on ${userSkills.length} skill${userSkills.length > 1 ? 's' : ''} in your profile` : 'Add skills in Profile to personalize this'}</span></div><div className="recommended-rail">{recommended.map((project) => <button key={project.title} className="recommended-card" onClick={() => onNavigate(`/project?project=${encodeURIComponent(project.id)}`)}><span>{project.score ? `${project.score} skill match${project.score > 1 ? 'es' : ''}` : 'New opportunity'}</span><h3>{project.title}</h3><p>{project.description}</p><strong>{project.budget}</strong><small>{project.time}</small></button>)}</div></section>
      <section className="all-work-section" ref={openProjectsRef}><div className="market-heading"><div><p className="section-label">Open projects</p><h2>{filtered.length} projects</h2></div><span>Clear scope · budget · timing</span></div><div className="work-list">{filtered.map((project) => <button className="work-row" key={project.title} onClick={() => onNavigate(`/project?project=${encodeURIComponent(project.id)}`)}><div><span className="work-type">{project.type}</span><h3>{project.title}</h3><p>{project.client} · {project.description}</p><div className="skill-pills">{project.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div><div className="work-meta"><strong>{project.budget}</strong><span>{project.time}</span><em>View →</em></div></button>)}</div></section>
      {selected && <div className="project-detail-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}><article className="project-detail"><button className="auth-close" onClick={() => setSelected(null)}>×</button><p className="section-label">{selected.type}</p><h2>{selected.title}</h2><p className="project-detail-client">{selected.client}</p><p>{selected.description}</p><div className="project-detail-grid"><div><span>Budget</span><strong>{selected.budget}</strong></div><div><span>Timeline</span><strong>{selected.time}</strong></div><div className="profile-wide"><span>Skills</span><div className="skill-pills">{selected.skills.map((s) => <span key={s}>{s}</span>)}</div></div></div><button className="primary-button" onClick={() => onNavigate(`/proposal?project=${encodeURIComponent(selected.id)}`)}>Start proposal →</button></article></div>}
    </main>
  }

  if (path === '/find-talent' && user?.role === 'client') {
    const filtered = talent.filter((person) => `${person.name} ${person.title} ${person.skills.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
    return <main className="marketplace-work-page talent-page-compact"><section className="work-intro work-intro-compact"><div><p className="section-label">Find talent</p><h1>What kind of person do you need?</h1><p>Search by skill, role or evidence. Profiles are built to show why someone could fit your project.</p></div></section><section className="talent-search-row"><div className="search-field"><span className="talent-search-icon">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search skills, roles or names" /></div><div className="talent-quick-filters">{['React', 'UI/UX', 'Research', 'Writing', 'Python'].map((skill) => <button type="button" key={skill} onClick={() => setQuery(skill)}>{skill}</button>)}</div></section><section className="all-work-section talent-results" ref={openProjectsRef}><div className="market-heading"><div><p className="section-label">Talent</p><h2>{filtered.length} people to explore</h2></div><span>{profile.workType || 'Ranked by project fit'}</span></div><div className="talent-market-grid">{filtered.map((person) => <article className="talent-market-card" key={person.name}><div className="talent-card-top"><div className="profile-avatar large">{person.name.charAt(0)}</div><span className="talent-fit">Strong fit</span></div><span className="work-type">{person.title}</span><h3>{person.name}</h3><p>{person.projects} completed projects · {person.rating} ★</p><div className="skill-pills">{person.skills.map((s) => <span key={s}>{s}</span>)}</div><button className="route-secondary-button" onClick={() => onNavigate(`/talent-profile?talent=${encodeURIComponent(person.id || person.name.toLowerCase().replace(/\s+/g, '-'))}`)}>View profile →</button></article>)}</div></section></main>
  }

  return <main className="route-page"><section className="route-hero"><div className="route-hero-copy"><p className="section-label">{content.eyebrow}</p><h1>{content.title}</h1><p className="route-description">{content.description}</p><div className="route-actions"><button className="primary-button" type="button" onClick={user ? () => onNavigate(path === '/find-talent' ? '/find-talent' : '/find-work') : onSignup}>{path === '/find-talent' ? 'Browse talent' : path === '/services' ? 'Browse services' : 'Find work'} →</button><button className="route-secondary-button" type="button" onClick={user ? () => onNavigate('/dashboard') : onSignup}>{user ? 'Open dashboard' : 'Create account'}</button></div></div><div className="route-signal" data-spotlight><span className="route-signal-label">POINTWAVE / LIVE VIEW</span><div className="route-orbit" aria-hidden="true"><span /><span /><span /></div><strong>{user ? 'Ready' : 'Explore'}</strong><p>{user ? 'Your account is active.' : 'Start with a PointWave account.'}</p><div className="route-pills"><span>Evidence first</span><span>Clear scope</span><span>Fair opportunity</span></div></div></section><section className="route-next"><p className="section-label">Next step</p><h2>{content.eyebrow === 'How it works' ? 'Define the work. Find the fit. Get it done.' : 'Your marketplace workspace is ready.'}</h2><p>{user ? 'Use the profile button in the top-right any time to return to your workspace.' : 'Create an account to personalize this experience and keep your work in one place.'}</p></section></main>
}

export { pageContent }
export default MarketplacePage
