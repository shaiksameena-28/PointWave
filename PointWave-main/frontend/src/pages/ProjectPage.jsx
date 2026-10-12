import { useMemo } from 'react'

const TALENT = [
  { id:'aarav-mehta', name:'Aarav Mehta', title:'Full-stack developer', skills:['React','JavaScript','Node','PostgreSQL'], rating:4.9, projects:28, categories:['Web development','Data & software'] },
  { id:'maya-rao', name:'Maya Rao', title:'Product designer', skills:['Figma','UI/UX','Research','Prototyping'], rating:4.9, projects:19, categories:['Design & UI/UX','Research & presentation'] },
  { id:'ishaan-verma', name:'Ishaan Verma', title:'Video editor', skills:['Video editing','After Effects','YouTube','Premiere'], rating:4.8, projects:31, categories:['Video & creative'] },
  { id:'sara-thomas', name:'Sara Thomas', title:'Research & technical writer', skills:['Research','Writing','Biotech','Copywriting'], rating:5, projects:14, categories:['Writing & content','Research & presentation'] },
  { id:'dev-patel', name:'Dev Patel', title:'Frontend developer', skills:['React','JavaScript','TypeScript','UI/UX'], rating:4.8, projects:22, categories:['Web development','Design & UI/UX'] },
  { id:'anika-shah', name:'Anika Shah', title:'Data analyst', skills:['Python','Data analysis','Pandas','Research'], rating:4.9, projects:17, categories:['Data & software','Research & presentation'] },
]

const read = (key, fallback = []) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

function getProfile() {
  return read('pointwave-profile', {})
}

function score(person, project) {
  const required = (project?.skills || []).map((s) => s.toLowerCase())
  const hits = person.skills.filter((s) => required.includes(s.toLowerCase()))
  const skill = required.length ? Math.round((hits.length / required.length) * 55) : 0
  const category = person.categories?.includes(project?.category) ? 20 : 8
  const experience = Number(person.projects || 0) >= 25 ? 12 : Number(person.projects || 0) >= 15 ? 10 : 7
  const rating = Number(person.rating || 4.8) >= 4.9 ? 5 : 4
  return { ...person, hits, score: Math.min(99, skill + category + experience + 8 + rating) }
}

function ProjectPage({ user, onNavigate }) {
  const params = new URLSearchParams(window.location.search)
  const projectId = params.get('project') || ''
  const projects = read('pointwave-client-projects', [])
  const marketplace = [
    { id:'market-react-website', title:'Build a React product website', client:'Northstar Labs', budget:'₹25,000–₹40,000', timeline:'2–3 weeks', skills:['React','UI/UX','JavaScript'], category:'Web development', description:'Build a polished marketing and product website with responsive layouts and reusable components.' },
    { id:'market-biotech-presentation', title:'Biotech research presentation design', client:'Helix Labs', budget:'₹8,000–₹15,000', timeline:'5–7 days', skills:['PowerPoint','Research','Biology'], category:'Presentation design', description:'Turn technical research into a clear, visual presentation for an upcoming research review.' },
    { id:'market-science-videos', title:'Edit short-form science videos', client:'Nova Media', budget:'₹12,000–₹22,000', timeline:'1–2 weeks', skills:['Video editing','YouTube','After Effects'], category:'Video editing', description:'Create a batch of concise educational videos with captions, pacing and clean visual treatment.' },
    { id:'market-python-data', title:'Python data cleaning workflow', client:'Verde Analytics', budget:'₹18,000–₹30,000', timeline:'1–2 weeks', skills:['Python','Data analysis','Pandas'], category:'Data & software', description:'Clean and structure recurring research datasets and document a repeatable workflow.' },
  ]
  const project = projects.find((item) => item.id === projectId) || marketplace.find((item) => item.id === projectId)

  const profile = getProfile()
  const profileSkills = (profile.skills || '').split(',').map((s) => s.trim()).filter(Boolean)
  const freelancerPerson = {
    skills: profileSkills,
    categories: [],
    projects: Number(profile.projectsCompleted || 0),
    rating: Number(profile.rating || 4.8),
  }
  const match = useMemo(() => {
    if (!project || user?.role !== 'freelancer') return null
    return score(freelancerPerson, project)
  }, [project, user?.role, profile.skills, profile.projectsCompleted, profile.rating])

  if (!project) {
    return <main className="project-page"><section className="project-empty"><p className="section-label">Project</p><h1>We couldn't find that project.</h1><button className="primary-button" onClick={() => onNavigate(user?.role === 'freelancer' ? '/find-work' : '/dashboard')}>Back →</button></section></main>
  }

  const applications = read('pointwave-applications', [])
  const currentUser = read('pointwave-user', {})
  const alreadyApplied = applications.some((item) => item.projectId === project.id && (item.freelancerEmail === currentUser.email || item.freelancerId === currentUser.email || item.freelancerName === currentUser.name))

  return (
    <main className="project-page">
      <div className="project-page-shell">
        <header className="project-page-header">
          <div>
            <p className="section-label">{project.category || 'Project'}</p>
            <h1>{project.title}</h1>
            <p>{project.description}</p>
          </div>
          <button className="route-secondary-button" onClick={() => onNavigate(user?.role === 'freelancer' ? '/find-work' : `/matches?project=${project.id}&view=applicants`)}>Back</button>
        </header>

        <section className="project-overview-grid">
          <article className="project-brief-card" data-spotlight>
            <div className="project-brief-top"><span>Project brief</span><b>{project.status || 'Open'}</b></div>
            <h2>What needs to be done</h2>
            <p className="project-long-description">{project.description}</p>
            <div className="project-requirements">
              <div><span>Budget</span><strong>{project.budget}</strong></div>
              <div><span>Timeline</span><strong>{project.timeline || project.time}</strong></div>
              <div><span>Client</span><strong>{project.client || 'PointWave client'}</strong></div>
            </div>
            <div className="project-skill-section"><span>Required skills</span><div className="skill-pills">{project.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div>
          </article>

          <aside className="project-action-card" data-spotlight>
            {user?.role === 'freelancer' ? (
              <>
                <p className="section-label">Your project fit</p>
                <div className="project-match-score"><strong>{match?.score || 0}%</strong><span>match</span></div>
                <p>{match?.hits?.length ? `${match.hits.length} of ${project.skills.length} required skills match your profile.` : 'Complete your profile skills to get a more useful match score.'}</p>
                <div className="project-match-list">{project.skills.map((skill) => {
                  const hit = match?.hits?.some((item) => item.toLowerCase() === skill.toLowerCase())
                  return <span className={hit ? 'matched' : ''} key={skill}>{hit ? '✓' : '○'} {skill}</span>
                })}</div>
                <button className="primary-button project-apply-button" disabled={alreadyApplied} onClick={() => onNavigate(`/proposal?project=${encodeURIComponent(project.id)}`)}>{alreadyApplied ? 'Proposal submitted ✓' : 'Apply to project →'}</button>
              </>
            ) : (
              <>
                <p className="section-label">Client hiring</p>
                <h2>Review people for this project.</h2>
                <p>Compare applicants separately from PointWave's recommended talent and move the strongest fit into your hiring flow.</p>
                <button className="primary-button" onClick={() => onNavigate(`/matches?project=${encodeURIComponent(project.id)}&view=applicants`)}>View applicants →</button>
                <button className="route-secondary-button" onClick={() => onNavigate(`/matches?project=${encodeURIComponent(project.id)}&view=recommended`)}>See recommended talent</button>
              </>
            )}
          </aside>
        </section>
      </div>
    </main>
  )
}

export default ProjectPage
