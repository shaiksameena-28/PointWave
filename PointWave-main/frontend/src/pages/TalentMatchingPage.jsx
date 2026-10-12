import { useMemo, useState } from 'react'

const TALENT = [
  { id:'aarav-mehta', name:'Aarav Mehta', title:'Full-stack developer', skills:['React','JavaScript','Node','PostgreSQL'], rating:4.9, projects:28, categories:['Web development','Data & software'], availability:'Available now', bio:'Builds polished web products with a strong focus on responsive React interfaces and reliable backend systems.', work:['SaaS dashboard redesign','React product website'] },
  { id:'maya-rao', name:'Maya Rao', title:'Product designer', skills:['Figma','UI/UX','Research','Prototyping'], rating:4.9, projects:19, categories:['Design & UI/UX','Research & presentation'], availability:'Available this week', bio:'Product designer who turns complex requirements into clear, usable flows, systems and prototypes.', work:['Fintech mobile flow','B2B product design system'] },
  { id:'ishaan-verma', name:'Ishaan Verma', title:'Video editor', skills:['Video editing','After Effects','YouTube','Premiere'], rating:4.8, projects:31, categories:['Video & creative'], availability:'Available now', bio:'Creates concise, high-retention edits with clean motion, captions and platform-ready delivery.', work:['Science education series','Short-form campaign'] },
  { id:'sara-thomas', name:'Sara Thomas', title:'Research & technical writer', skills:['Research','Writing','Biotech','Copywriting'], rating:5.0, projects:14, categories:['Writing & content','Research & presentation'], availability:'Available this week', bio:'Research-focused writer who turns technical material into clear documents, presentations and practical content.', work:['Biotech research review','Technical report series'] },
  { id:'dev-patel', name:'Dev Patel', title:'Frontend developer', skills:['React','JavaScript','TypeScript','UI/UX'], rating:4.8, projects:22, categories:['Web development','Design & UI/UX'], availability:'Available now', bio:'Frontend specialist focused on fast, accessible interfaces and thoughtful interaction details.', work:['Commerce frontend','Analytics dashboard'] },
  { id:'anika-shah', name:'Anika Shah', title:'Data analyst', skills:['Python','Data analysis','Pandas','Research'], rating:4.9, projects:17, categories:['Data & software','Research & presentation'], availability:'Available this week', bio:'Analyst who cleans messy datasets, finds useful patterns and documents repeatable workflows.', work:['Research data pipeline','Operations reporting'] },
]

const readProjects = () => { try { return JSON.parse(localStorage.getItem('pointwave-client-projects') || '[]') } catch { return [] } }
const readList = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
const readApplications = () => { try { return JSON.parse(localStorage.getItem('pointwave-applications') || '[]') } catch { return [] } }
const writeList = (key, value) => localStorage.setItem(key, JSON.stringify(value))

function score(person, project) {
  const required = (project?.skills || []).map((s) => s.toLowerCase())
  const hits = person.skills.filter((s) => required.includes(s.toLowerCase()))
  const skill = required.length ? Math.round((hits.length / required.length) * 55) : 0
  const category = person.categories.includes(project?.category) ? 20 : 8
  const experience = person.projects >= 25 ? 12 : person.projects >= 15 ? 10 : 7
  const availability = person.availability?.toLowerCase().includes('now') ? 8 : 6
  const rating = person.rating >= 4.9 ? 5 : person.rating >= 4.8 ? 4 : 3
  return { ...person, hits, score: Math.min(99, skill + category + experience + availability + rating), breakdown: { skill, category, experience, availability, rating } }
}

function TalentMatchingPage({ user, onNavigate }) {
  const projects = readProjects()
  const params = new URLSearchParams(window.location.search)
  const [selectedId, setSelectedId] = useState(() => params.get('project') || projects[0]?.id || '')
  const [view, setView] = useState(() => params.get('view') || 'applicants')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('match')
  const [selectedTalent, setSelectedTalent] = useState(null)
  const [shortlisted, setShortlisted] = useState(() => readList('pointwave-shortlisted-talent'))
  const [invited, setInvited] = useState(() => readList('pointwave-talent-invites'))
  const [hires, setHires] = useState(() => readList('pointwave-project-hires'))
  const [applications] = useState(() => readApplications())

  const project = projects.find((item) => item.id === selectedId) || projects[0]

  const ranked = useMemo(() => {
    if (!project) return []
    const q = query.trim().toLowerCase()
    const result = TALENT.map((person) => score(person, project)).filter((person) => !q || `${person.name} ${person.title} ${person.skills.join(' ')}`.toLowerCase().includes(q))
    if (sort === 'rating') return result.sort((a,b) => b.rating - a.rating)
    if (sort === 'experience') return result.sort((a,b) => b.projects - a.projects)
    return result.sort((a,b) => b.score - a.score)
  }, [project, query, sort])

  const applicants = useMemo(() => {
    if (!project) return []
    const q = query.trim().toLowerCase()
    return applications
      .filter((item) => item.projectId === project.id)
      .map((item) => score({
        id: item.freelancerId,
        name: item.freelancerName,
        title: item.title || 'Freelancer',
        skills: item.skills || [],
        rating: Number(item.rating || 4.8),
        projects: Number(item.projects || 0),
        categories: item.categories || [],
        availability: item.availability || 'Available',
        bio: item.bio || 'PointWave freelancer applicant.',
        work: item.work || [],
      }, project))
      .filter((person) => !q || `${person.name} ${person.title} ${person.skills.join(' ')}`.toLowerCase().includes(q))
      .sort((a,b) => b.score - a.score)
  }, [applications, project, query])

  const toggleShortlist = (id) => {
    const isNowShortlisted = !shortlisted.includes(id)
    const next = isNowShortlisted ? [...shortlisted, id] : shortlisted.filter((item) => item !== id)
    setShortlisted(next); writeList('pointwave-shortlisted-talent', next)
    const updatedApplications = applications.map((item) => item.projectId === project?.id && (item.freelancerId === id || item.freelancerName === id)
      ? { ...item, status: isNowShortlisted ? 'Shortlisted' : 'Submitted' }
      : item)
    writeList('pointwave-applications', updatedApplications)
  }
  const invite = (person) => {
    if (!project) return
    const record = { projectId: project.id, talentId: person.id, createdAt: new Date().toISOString() }
    const next = [...invited.filter((item) => !(item.projectId === project.id && item.talentId === person.id)), record]
    setInvited(next); writeList('pointwave-talent-invites', next)
  }
  const hired = project ? hires.find((item) => item.projectId === project.id) : null

  const hirePerson = (person) => {
    if (!project || hired) return
    const currentClient = (() => { try { return JSON.parse(localStorage.getItem('pointwave-user') || '{}') } catch { return {} } })()
    const applicant = applications.find((item) => item.projectId === project.id && (item.freelancerId === person.id || item.freelancerName === person.name))
    const record = {
      projectId: project.id,
      talentId: person.id,
      freelancerId: applicant?.freelancerEmail || applicant?.freelancerId || person.id,
      freelancerEmail: applicant?.freelancerEmail || '',
      freelancerName: person.name,
      clientEmail: currentClient?.email || '',
      clientName: currentClient?.name || 'Client',
      match: person.score,
      progress: 10,
      status: 'In progress',
      startedAt: new Date().toISOString(),
      currentStage: 'Brief confirmed',
    }
    const next = [...hires.filter((item) => item.projectId !== project.id), record]
    setHires(next)
    writeList('pointwave-project-hires', next)

    const updatedApplications = applications.map((item) => item.projectId === project.id && (item.freelancerId === person.id || item.freelancerName === person.name)
      ? { ...item, status: 'Accepted', match: person.score }
      : item)
    writeList('pointwave-applications', updatedApplications)

    const conversations = readList('pointwave-conversations')
    const conversation = {
      id: `conversation-${project.id}-${person.id}`,
      projectId: project.id,
      projectTitle: project.title,
      clientEmail: currentClient.email || '',
      clientName: currentClient.name || 'Client',
      freelancerEmail: applications.find((item) => item.freelancerId === person.id)?.freelancerEmail || '',
      freelancerName: person.name,
      messages: [{ id: `message-${Date.now()}`, senderEmail: currentClient.email || '', senderName: currentClient.name || 'Client', text: 'Project hired — your workspace conversation is ready.', createdAt: new Date().toISOString() }],
      lastMessage: 'Project hired — your workspace conversation is ready.',
      unreadCount: 1,
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    writeList('pointwave-conversations', [...conversations.filter((item) => item.id !== conversation.id), conversation])
  }

  const updateProgress = (amount = 10) => {
    if (!hired) return
    const next = hires.map((item) => {
      if (item.projectId !== project.id) return item
      const progress = Math.min(100, Number(item.progress || 0) + amount)
      const currentStage = progress >= 100 ? 'Final delivery' : progress >= 75 ? 'Client review' : progress >= 40 ? 'First working version' : 'Brief confirmed'
      return { ...item, progress, currentStage, status: progress >= 100 ? 'Completed' : 'In progress', completedAt: progress >= 100 ? (item.completedAt || new Date().toISOString()) : item.completedAt }
    })
    setHires(next)
    writeList('pointwave-project-hires', next)
  }
  const switchView = (next) => {
    setView(next)
    window.history.replaceState({}, '', `/matches?project=${project?.id || ''}&view=${next}`)
  }

  if (user?.role !== 'client') return <main className="matching-page"><section className="matching-empty"><p className="section-label">Talent matching</p><h1>Find talent from the client workspace.</h1><p>Create or open a client account to compare freelancers against a project brief.</p><button className="primary-button" onClick={() => onNavigate('/dashboard')}>Back to workspace →</button></section></main>
  if (!project) return <main className="matching-page"><section className="matching-empty"><p className="section-label">Talent matching</p><h1>Your project needs a brief first.</h1><p>Post a project and PointWave will rank the strongest available matches against its requirements.</p><button className="primary-button" onClick={() => onNavigate('/post-project')}>Post a project →</button></section></main>

  const people = view === 'applicants' ? applicants : ranked

  return <main className="matching-page">
    <div className="matching-shell">
      <header className="matching-header">
        <div><p className="section-label">Client workspace · {view === 'applicants' ? 'Applications' : 'Talent matching'}</p><h1>{view === 'applicants' ? 'People who applied.' : 'People who fit the work.'}</h1><p>{view === 'applicants' ? 'Review freelancers who actually submitted a proposal for this project, then compare their fit before moving forward.' : 'PointWave compares skills, category fit, experience, availability and evidence — then puts the strongest matches first.'}</p></div>
        <button className="route-secondary-button" onClick={() => onNavigate('/dashboard')}>Client workspace</button>
      </header>

      <section className="matching-project-bar">
        <div className="matching-project-main"><span>Project</span><strong>{project.title}</strong><small>{project.budget} · {project.timeline} · {project.skills.join(' · ')}</small></div>
        <label className="project-switcher"><span>Project</span><select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setSelectedTalent(null) }}>{projects.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      </section>

      {hired && <section className="hired-project-banner" data-spotlight>
        <div className="hired-project-copy"><span className="project-live-status">PROJECT IN PROGRESS</span><h2>{hired.freelancerName} is working on this project.</h2><p>Selected at <b>{hired.match}% match</b>. The project is currently <b>{hired.progress}% complete</b>.</p></div>
        <div className="hired-progress"><div className="hired-progress-top"><span>Progress</span><strong>{hired.progress}%</strong></div><div className="hired-progress-track"><i style={{width:`${hired.progress}%`}} /></div><button className="mini-action" onClick={() => updateProgress(10)} disabled={hired.progress >= 100}>{hired.progress >= 100 ? 'Completed' : 'Update +10%'}</button></div>
      </section>}

      <div className="matching-view-tabs" role="tablist">
        <button className={view === 'applicants' ? 'active' : ''} onClick={() => switchView('applicants')}>Applicants <b>{applications.filter((item) => item.projectId === project.id).length}</b></button>
        <button className={view === 'recommended' ? 'active' : ''} onClick={() => switchView('recommended')}>Recommended <b>{ranked.length}</b></button>
      </div>

      <section className="matching-controls">
        <div className="matching-search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={view === 'applicants' ? 'Search applicants, roles or skills' : 'Search talent, roles or skills'} /></div>
        {view === 'recommended' && <div className="matching-sort"><span>Sort</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="match">Best match</option><option value="rating">Highest rated</option><option value="experience">Most experience</option></select></div>}
        <div className="matching-count">{people.length} {view === 'applicants' ? 'applicants' : 'matches'} · {shortlisted.length} shortlisted</div>
      </section>

      <div className="matching-layout">
        <section className="matching-results">
          <div className="matching-results-head"><div><p className="section-label">{view === 'applicants' ? 'Submitted proposals' : 'Recommended talent'}</p><h2>{view === 'applicants' ? `${people.length} ${people.length === 1 ? 'applicant' : 'applicants'}` : 'Best matches'}</h2></div><span>{view === 'applicants' ? 'Actual applications for this project' : 'Higher match = closer fit'}</span></div>
          {people.length ? <div className="talent-match-list">{people.map((person, index) => <article className={`talent-match-row ${index === 0 ? 'top-match' : ''}`} key={person.id} data-spotlight>
            <div className="match-rank">{String(index + 1).padStart(2,'0')}</div>
            <div className="match-avatar">{person.name.charAt(0)}</div>
            <div className="match-person"><div className="match-person-title"><div><span>{person.title}</span><h3>{person.name}</h3></div><strong>{person.score}% <small>match</small></strong></div><p>{person.bio}</p><div className="match-chip-row">{person.skills.map((skill) => <span className={person.hits.some((hit) => hit.toLowerCase() === skill.toLowerCase()) ? 'hit' : ''} key={skill}>{skill}{person.hits.some((hit) => hit.toLowerCase() === skill.toLowerCase()) ? ' ✓' : ''}</span>)}</div></div>
            <div className="match-evidence"><span>{person.projects || 0} projects</span><span>★ {person.rating}</span><span>{person.availability}</span></div>
            <div className="match-row-actions"><div className="match-score-ring"><b>{person.score}%</b><span>fit</span></div><button className={shortlisted.includes(person.id) ? 'mini-action saved' : 'mini-action'} onClick={() => toggleShortlist(person.id)}>{shortlisted.includes(person.id) ? 'Shortlisted' : 'Shortlist'}</button><button className="mini-action primary-mini" onClick={() => onNavigate(`/talent-profile?talent=${encodeURIComponent(person.id)}&project=${encodeURIComponent(project.id)}&source=${view}`)}>View profile</button>{view === 'applicants' && <button className="mini-action" onClick={() => { const application = applications.find((item) => item.projectId === project.id && (item.freelancerId === person.id || item.freelancerName === person.name)); if (application) onNavigate(`/proposal?project=${encodeURIComponent(project.id)}&application=${encodeURIComponent(application.id)}&view=client`) }}>View proposal</button>}<button className="mini-action hire-mini" disabled={Boolean(hired)} onClick={() => hirePerson(person)}>{hired?.talentId === person.id ? 'Hired ✓' : hired ? 'Project taken' : 'Hire'}</button></div>
          </article>)}</div> : <div className="matching-empty-state"><div className="empty-state-mark">0</div><div><p className="section-label">No applications yet</p><h3>No one has applied to this project.</h3><p>That is different from recommended talent. You can still browse strong matches and invite someone directly.</p><button className="primary-button" onClick={() => switchView('recommended')}>Browse recommended talent →</button></div></div>}
        </section>

        <aside className="matching-insight" data-spotlight>
          <p className="section-label">Project hiring view</p><h2>{view === 'applicants' ? `${applicants.length} applied` : `${ranked[0]?.score || 0}% top match`}</h2><p>{view === 'applicants' ? 'Applicants are people who have actually submitted a proposal. Recommended talent is kept separate so the distinction stays clear.' : 'The score is transparent for this prototype. Skills carry the most weight because they describe the actual work.'}</p>
          {view === 'recommended' && <div className="score-bars">{[['Skills',55],['Category fit',20],['Experience',12],['Availability',8],['Rating',5]].map(([label,weight]) => <div key={label}><div><span>{label}</span><b>{weight}%</b></div><i><em style={{width:`${weight}%`}} /></i></div>)}</div>}
          <div className="project-fit-note"><span>Project fit</span><strong>{project.skills.length} required skills</strong><small>{project.category} · {project.timeline}</small></div>
          <button className="route-secondary-button" onClick={() => switchView(view === 'applicants' ? 'recommended' : 'applicants')}>{view === 'applicants' ? 'See recommended talent →' : 'See applicants →'}</button>
        </aside>
      </div>
    </div>

    {selectedTalent && <div className="talent-drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setSelectedTalent(null)}><aside className="talent-drawer"><button className="drawer-close" onClick={() => setSelectedTalent(null)}>×</button><div className="drawer-hero"><div className="match-avatar huge">{selectedTalent.name.charAt(0)}</div><div><p className="section-label">{selectedTalent.title}</p><h2>{selectedTalent.name}</h2><p>★ {selectedTalent.rating} · {selectedTalent.projects || 0} completed projects</p></div><strong>{selectedTalent.score}%<small>match</small></strong></div><div className="drawer-section"><span>Why they match</span><div className="drawer-reasons"><b>{selectedTalent.hits.length}/{project.skills.length} required skills</b><b>{selectedTalent.categories?.includes(project.category) ? 'Category aligned' : 'Adjacent category'}</b><b>{selectedTalent.availability}</b></div></div><div className="drawer-section"><span>Skills</span><div className="match-chip-row large-chips">{selectedTalent.skills.map((s) => <i className={selectedTalent.hits.includes(s) ? 'hit' : ''} key={s}>{s}{selectedTalent.hits.includes(s) ? ' ✓' : ''}</i>)}</div></div><div className="drawer-section"><span>About</span><p>{selectedTalent.bio}</p></div><div className="drawer-section"><span>Previous work</span>{(selectedTalent.work || []).map((item) => <div className="drawer-work" key={item}><b>{item}</b><small>Relevant portfolio evidence</small></div>)}</div><div className="drawer-actions"><button className="route-secondary-button" onClick={() => toggleShortlist(selectedTalent.id)}>{shortlisted.includes(selectedTalent.id) ? 'Remove shortlist' : 'Shortlist talent'}</button><button className="primary-button" onClick={() => invite(selectedTalent)}>{invited.some((item) => item.projectId === project.id && item.talentId === selectedTalent.id) ? 'Invite sent ✓' : 'Invite to project →'}</button></div></aside></div>}
  </main>
}

export default TalentMatchingPage
