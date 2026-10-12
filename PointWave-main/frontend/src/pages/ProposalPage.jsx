import { useMemo, useState } from 'react'

const read = (key, fallback = []) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

function scoreMatch(profile, project) {
  const skills = (profile.skills || '').split(',').map((s) => s.trim()).filter(Boolean)
  const required = project?.skills || []
  const hits = skills.filter((skill) => required.some((item) => item.toLowerCase() === skill.toLowerCase()))
  const score = required.length ? Math.min(99, Math.round((hits.length / required.length) * 75) + (profile.experience === 'Advanced' ? 12 : profile.experience === 'Intermediate' ? 10 : 7) + 5) : 0
  return { skills, hits, score }
}

function ProposalPage({ user, onNavigate }) {
  const params = new URLSearchParams(window.location.search)
  const projectId = params.get('project') || ''
  const applicationId = params.get('application') || ''
  const clientView = params.get('view') === 'client'
  const projects = read('pointwave-client-projects', [])
  const marketplaceProjects = [
    { id:'market-react-website', title:'Build a React product website', client:'Northstar Labs', budget:'₹25,000–₹40,000', timeline:'2–3 weeks', skills:['React','UI/UX','JavaScript'], category:'Web development', description:'Build a polished marketing and product website with responsive layouts and reusable components.' },
    { id:'market-biotech-presentation', title:'Biotech research presentation design', client:'Helix Labs', budget:'₹8,000–₹15,000', timeline:'5–7 days', skills:['PowerPoint','Research','Biology'], category:'Presentation design', description:'Turn technical research into a clear, visual presentation for an upcoming research review.' },
    { id:'market-science-videos', title:'Edit short-form science videos', client:'Nova Media', budget:'₹12,000–₹22,000', timeline:'1–2 weeks', skills:['Video editing','YouTube','After Effects'], category:'Video editing', description:'Create a batch of concise educational videos with captions, pacing and clean visual treatment.' },
    { id:'market-python-data', title:'Python data cleaning workflow', client:'Verde Analytics', budget:'₹18,000–₹30,000', timeline:'1–2 weeks', skills:['Python','Data analysis','Pandas'], category:'Data & software', description:'Clean and structure recurring research datasets and document a repeatable workflow.' },
  ]
  const project = projects.find((item) => item.id === projectId) || marketplaceProjects.find((item) => item.id === projectId)
  const applications = read('pointwave-applications', [])
  const application = applications.find((item) => item.id === applicationId)
  const profile = read('pointwave-profile', {})
  const currentUser = read('pointwave-user', {})
  const match = useMemo(() => scoreMatch(profile, project), [profile.skills, profile.experience, project])

  const [coverLetter, setCoverLetter] = useState('')
  const [budget, setBudget] = useState(project?.budget || '')
  const [timeline, setTimeline] = useState(project?.timeline || 'Flexible')
  const [error, setError] = useState('')

  if (!project) return <main className="proposal-page"><section className="proposal-empty"><p className="section-label">Proposal</p><h1>Project not found.</h1><button className="primary-button" onClick={() => onNavigate('/find-work')}>Back to work →</button></section></main>

  const submit = () => {
    if (!coverLetter.trim() || !budget.trim() || !timeline.trim()) {
      setError('Add a short cover letter, proposed budget and timeline before submitting.')
      return
    }
    const next = {
      id: `app-${Date.now()}`,
      projectId: project.id,
      projectTitle: project.title,
      client: project.client || 'PointWave client',
      freelancerId: currentUser.email || currentUser.name || `freelancer-${Date.now()}`,
      freelancerName: currentUser.name || 'Freelancer',
      profilePhoto: profile.profilePhoto || '',
      resumeName: profile.resumeName || '',
      resumeDataUrl: profile.resumeDataUrl || '',
      resumeCreated: Boolean(profile.resumeCreated),
      resumeHeadline: profile.resumeHeadline || '',
      resumeSummary: profile.resumeSummary || '',
      resumeExperience: profile.resumeExperience || '',
      resumeEducation: profile.resumeEducation || '',
      freelancerEmail: currentUser.email || '',
      title: profile.title || 'Freelancer',
      skills: match.skills,
      matchedSkills: match.hits,
      rating: Number(profile.rating || 4.8),
      projects: Number(profile.projectsCompleted || 0),
      availability: profile.availability || 'Available',
      bio: profile.bio || 'PointWave freelancer profile.',
      work: profile.projects || [],
      categories: [],
      education: profile.education || '',
      experience: profile.experience || '',
      links: [],
      coverLetter: coverLetter.trim(),
      proposedBudget: budget.trim(),
      proposedTimeline: timeline.trim(),
      match: match.score,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
    }
    const existing = applications.filter((item) => !(item.projectId === project.id && (item.freelancerEmail === next.freelancerEmail || item.freelancerName === next.freelancerName)))
    localStorage.setItem('pointwave-applications', JSON.stringify([next, ...existing]))
    onNavigate(`/dashboard?tab=proposals`)
  }

  if (clientView && application) {
    return (
      <main className="proposal-page">
        <div className="proposal-shell">
          <header className="proposal-header"><div><p className="section-label">Client · proposal</p><h1>{application.freelancerName}</h1><p>{application.title} · {application.projectTitle}</p></div><button className="route-secondary-button" onClick={() => onNavigate(`/matches?project=${project.id}&view=applicants`)}>Back to applicants</button></header>
          <section className="proposal-client-grid">
            <article className="proposal-card proposal-cover-card" data-spotlight><div className="proposal-match-badge">{application.match || 0}% match</div><p className="section-label">Proposal</p><h2>Why they want this project</h2><p className="proposal-cover">{application.coverLetter || 'No cover letter provided.'}</p><div className="proposal-meta-grid"><div><span>Proposed budget</span><strong>{application.proposedBudget || project.budget}</strong></div><div><span>Timeline</span><strong>{application.proposedTimeline || project.timeline}</strong></div><div><span>Status</span><strong>{application.status}</strong></div><div><span>Submitted</span><strong>{new Date(application.createdAt).toLocaleDateString()}</strong></div></div></article>
            <aside className="proposal-card"><p className="section-label">Fit evidence</p><h2>{application.match || 0}% match</h2><p>{application.matchedSkills?.length || 0} required skills matched.</p><div className="proposal-skill-list">{(project.skills || []).map((skill) => <span className={application.matchedSkills?.some((x) => x.toLowerCase() === skill.toLowerCase()) ? 'matched' : ''} key={skill}>{application.matchedSkills?.some((x) => x.toLowerCase() === skill.toLowerCase()) ? '✓' : '○'} {skill}</span>)}</div><button className="route-secondary-button" onClick={() => onNavigate(`/talent-profile?talent=${encodeURIComponent(application.freelancerId)}&project=${encodeURIComponent(project.id)}&source=applicants`)}>View full profile →</button></aside>
          </section>
        </div>
      </main>
    )
  }

  if (user?.role !== 'freelancer') return <main className="proposal-page"><section className="proposal-empty"><p className="section-label">Freelancer proposal</p><h1>Open this flow from a freelancer account.</h1><button className="primary-button" onClick={() => onNavigate('/dashboard')}>Back to workspace →</button></section></main>

  return (
    <main className="proposal-page">
      <div className="proposal-shell">
        <header className="proposal-header"><div><p className="section-label">Freelancer · submit proposal</p><h1>Make your case for the work.</h1><p>{project.title} · {project.client || 'PointWave client'}</p></div><button className="route-secondary-button" onClick={() => onNavigate(`/project?project=${encodeURIComponent(project.id)}`)}>Back to project</button></header>
        <div className="proposal-layout">
          <section className="proposal-form-card" data-spotlight>
            <div className="proposal-project-mini"><span>{project.category}</span><strong>{project.title}</strong><small>{project.budget} · {project.timeline}</small></div>
            <label>Cover letter<textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Explain how you would approach the work, what makes you a strong fit and what you would deliver." /></label>
            <div className="proposal-two-col"><label>Proposed budget<input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={project.budget} /></label><label>Proposed timeline<input value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="e.g. 2 weeks" /></label></div>
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button" onClick={submit}>Submit proposal →</button>
          </section>
          <aside className="proposal-fit-card" data-spotlight>
            <p className="section-label">Your fit</p><div className="proposal-fit-score"><strong>{match.score}%</strong><span>match</span></div><p>PointWave compares your profile with this brief before you apply.</p><div className="proposal-skill-list">{project.skills.map((skill) => { const hit = match.hits.some((x) => x.toLowerCase() === skill.toLowerCase()); return <span className={hit ? 'matched' : ''} key={skill}>{hit ? '✓' : '○'} {skill}</span> })}</div><div className="proposal-profile-summary"><span>Profile</span><strong>{profile.title || 'Add a professional title'}</strong><small>{match.skills.length ? match.skills.join(' · ') : 'Add skills in your profile to improve matching.'}</small></div></aside>
        </div>
      </div>
    </main>
  )
}

export default ProposalPage
