import { useMemo } from 'react'

const TALENT = [
  { id:'aarav-mehta', name:'Aarav Mehta', title:'Full-stack developer', skills:['React','JavaScript','Node','PostgreSQL'], rating:4.9, projects:28, categories:['Web development','Data & software'], availability:'Available now', bio:'Builds polished web products with a strong focus on responsive React interfaces and reliable backend systems.', work:['SaaS dashboard redesign','React product website'] },
  { id:'maya-rao', name:'Maya Rao', title:'Product designer', skills:['Figma','UI/UX','Research','Prototyping'], rating:4.9, projects:19, categories:['Design & UI/UX','Research & presentation'], availability:'Available this week', bio:'Product designer who turns complex requirements into clear, usable flows, systems and prototypes.', work:['Fintech mobile flow','B2B product design system'] },
  { id:'ishaan-verma', name:'Ishaan Verma', title:'Video editor', skills:['Video editing','After Effects','YouTube','Premiere'], rating:4.8, projects:31, categories:['Video & creative'], availability:'Available now', bio:'Creates concise, high-retention edits with clean motion, captions and platform-ready delivery.', work:['Science education series','Short-form campaign'] },
  { id:'sara-thomas', name:'Sara Thomas', title:'Research & technical writer', skills:['Research','Writing','Biotech','Copywriting'], rating:5.0, projects:14, categories:['Writing & content','Research & presentation'], availability:'Available this week', bio:'Research-focused writer who turns technical material into clear documents, presentations and practical content.', work:['Biotech research review','Technical report series'] },
  { id:'dev-patel', name:'Dev Patel', title:'Frontend developer', skills:['React','JavaScript','TypeScript','UI/UX'], rating:4.8, projects:22, categories:['Web development','Design & UI/UX'], availability:'Available now', bio:'Frontend specialist focused on fast, accessible interfaces and thoughtful interaction details.', work:['Commerce frontend','Analytics dashboard'] },
  { id:'anika-shah', name:'Anika Shah', title:'Data analyst', skills:['Python','Data analysis','Pandas','Research'], rating:4.9, projects:17, categories:['Data & software','Research & presentation'], availability:'Available this week', bio:'Analyst who cleans messy datasets, finds useful patterns and documents repeatable workflows.', work:['Research data pipeline','Operations reporting'] },
]

const read = (key, fallback = []) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

function score(person, project) {
  const required = (project?.skills || []).map((s) => s.toLowerCase())
  const hits = person.skills.filter((s) => required.includes(s.toLowerCase()))
  const skill = required.length ? Math.round((hits.length / required.length) * 55) : 0
  const category = person.categories?.includes(project?.category) ? 20 : 8
  const experience = Number(person.projects || 0) >= 25 ? 12 : Number(person.projects || 0) >= 15 ? 10 : 7
  const availability = person.availability?.toLowerCase().includes('now') ? 8 : 6
  const rating = Number(person.rating || 4.8) >= 4.9 ? 5 : Number(person.rating || 4.8) >= 4.8 ? 4 : 3
  return { ...person, hits, score: Math.min(99, skill + category + experience + availability + rating) }
}

function TalentProfilePage({ user, onNavigate }) {
  const params = new URLSearchParams(window.location.search)
  const talentId = params.get('talent') || ''
  const projectId = params.get('project') || ''

  const projects = read('pointwave-client-projects', [])
  const applications = read('pointwave-applications', [])
  const project = projects.find((item) => item.id === projectId)

  const person = useMemo(() => {
    const staticPerson = TALENT.find((item) => item.id === talentId)
    if (staticPerson) return staticPerson

    const applicant = applications.find((item) => String(item.freelancerId) === talentId)
    if (!applicant) return null

    return {
      id: applicant.freelancerId,
      name: applicant.freelancerName || 'Freelancer',
      title: applicant.title || 'Freelancer',
      skills: applicant.skills || [],
      rating: Number(applicant.rating || 4.8),
      projects: Number(applicant.projects || 0),
      categories: applicant.categories || [],
      availability: applicant.availability || 'Available',
      bio: applicant.bio || 'PointWave freelancer applicant.',
      work: applicant.work || [],
      categories: applicant.categories || [],
      education: applicant.education || '',
      experience: applicant.experience || '',
      links: applicant.links || [],
      profilePhoto: applicant.profilePhoto || '',
      resumeName: applicant.resumeName || '',
      resumeDataUrl: applicant.resumeDataUrl || '',
      resumeCreated: Boolean(applicant.resumeCreated),
      resumeHeadline: applicant.resumeHeadline || '',
      resumeSummary: applicant.resumeSummary || '',
      resumeExperience: applicant.resumeExperience || '',
      resumeEducation: applicant.resumeEducation || '',
    }
  }, [talentId, applications])

  if (user?.role !== 'client') {
    return (
      <main className="talent-profile-page">
        <section className="talent-profile-empty">
          <p className="section-label">Talent profile</p>
          <h1>Profiles are available from the client workspace.</h1>
          <button className="primary-button" onClick={() => onNavigate('/dashboard')}>Back to workspace →</button>
        </section>
      </main>
    )
  }

  if (!person) {
    return (
      <main className="talent-profile-page">
        <section className="talent-profile-empty">
          <p className="section-label">Talent profile</p>
          <h1>That profile could not be found.</h1>
          <p>The person may no longer be available in this prototype.</p>
          <button className="route-secondary-button" onClick={() => onNavigate(projectId ? `/matches?project=${projectId}` : '/find-talent')}>Back to talent →</button>
        </section>
      </main>
    )
  }

  const match = project ? score(person, project) : null

  return (
    <main className="talent-profile-page">
      <div className="talent-profile-shell">
        <header className="talent-profile-header">
          <button className="route-secondary-button" onClick={() => onNavigate(projectId ? `/matches?project=${projectId}&view=${params.get('source') === 'applicants' ? 'applicants' : 'recommended'}` : '/find-talent')}>← Back</button>
          <p className="section-label">Freelancer profile</p>
          <div className="talent-profile-title">
            <div className="profile-avatar profile-avatar-xl">{person.profilePhoto ? <img src={person.profilePhoto} alt={`${person.name} profile`} /> : person.name.charAt(0)}</div>
            <div>
              <span className="work-type">{person.title}</span>
              <h1>{person.name}</h1>
              <p>{person.projects || 0} completed projects · ★ {person.rating} · {person.availability}</p>
            </div>
            {match && <div className="profile-match-badge"><strong>{match.score}%</strong><span>project fit</span></div>}
          </div>
        </header>

        <div className="profile-stat-strip">
          <div><span>Completed</span><strong>{person.projects || 0}</strong><small>projects</small></div>
          <div><span>Rating</span><strong>★ {person.rating}</strong><small>client rating</small></div>
          <div><span>Availability</span><strong>{person.availability}</strong><small>current status</small></div>
          <div><span>Specialties</span><strong>{person.categories?.length || 0}</strong><small>areas</small></div>
        </div>

        <div className="talent-profile-grid">
          <section className="talent-profile-main">
            <div className="profile-block">
              <p className="section-label">About</p>
              <h2>How they work</h2>
              <p className="profile-about-copy">{person.bio}</p>
            </div>

            <div className="profile-block profile-snapshot">
              <p className="section-label">Professional snapshot</p>
              <div className="profile-snapshot-grid">
                <div><span>Role</span><strong>{person.title}</strong></div>
                <div><span>Availability</span><strong>{person.availability}</strong></div>
                <div><span>Specialties</span><strong>{person.categories?.length ? person.categories.join(' · ') : 'General freelance'}</strong></div>
                <div><span>Experience</span><strong>{person.experience || `${person.projects || 0} completed projects`}</strong></div>
              </div>
            </div>

            <div className="profile-block">
              <p className="section-label">Skills</p>
              <h2>Core skills</h2>
              <div className="profile-skill-grid">{person.skills.map((skill) => <span className={match?.hits?.some((hit) => hit.toLowerCase() === skill.toLowerCase()) ? 'profile-skill matched' : 'profile-skill'} key={skill}>{skill}{match?.hits?.some((hit) => hit.toLowerCase() === skill.toLowerCase()) ? ' ✓' : ''}</span>)}</div>
            </div>

            <div className="profile-block profile-resume-block">
              <p className="section-label">Resume</p>
              <h2>Professional resume</h2>
              {person.resumeDataUrl ? (
                <div className="profile-resume-viewer">
                  <div className="profile-resume-file"><span>PDF</span><div><strong>{person.resumeName || 'Freelancer resume'}</strong><small>Uploaded resume · available to review</small></div></div>
                  <iframe title={`${person.name} resume`} src={person.resumeDataUrl} className="profile-resume-frame" />
                  <a className="route-secondary-button" href={person.resumeDataUrl} target="_blank" rel="noreferrer">Open resume ↗</a>
                </div>
              ) : person.resumeCreated ? (
                <div className="profile-resume-created">
                  <strong>{person.resumeHeadline || `${person.name}'s resume`}</strong>
                  {person.resumeSummary && <p>{person.resumeSummary}</p>}
                  <div className="profile-resume-meta">{person.resumeEducation && <span>Education · {person.resumeEducation}</span>}{person.resumeExperience && <span>Experience · {person.resumeExperience}</span>}</div>
                </div>
              ) : <div className="profile-resume-empty">Resume not shared yet.</div>}
            </div>

            <div className="profile-block">
              <p className="section-label">Previous work</p>
              <h2>Evidence</h2>
              <div className="profile-work-list">
                {(person.work?.length ? person.work : ['No showcase projects added yet.']).map((item) => (
                  <article key={item}><span>PROJECT</span><strong>{item}</strong><p>Relevant portfolio evidence for clients reviewing this profile.</p></article>
                ))}
              </div>
            </div>
          </section>

          <aside className="talent-profile-side">
            {match && (
              <section className="profile-match-panel">
                <p className="section-label">Project match</p>
                <div className="profile-match-score"><strong>{match.score}%</strong><span>match</span></div>
                <p>Based on the requirements for <b>{project.title}</b>.</p>
                <div className="profile-match-facts">
                  <span><b>{match.hits.length}</b><small>skills matched</small></span>
                  <span><b>{person.projects}</b><small>completed</small></span>
                  <span><b>★ {person.rating}</b><small>rating</small></span>
                </div>
                <div className="profile-match-reasons">
                  <div><span>Category</span><b>{person.categories?.includes(project.category) ? 'Aligned' : 'Adjacent'}</b></div>
                  <div><span>Availability</span><b>{person.availability}</b></div>
                  <div><span>Timeline</span><b>{project.timeline}</b></div>
                </div>
              </section>
            )}

            <section className="profile-contact-panel">
              <p className="section-label">Next step</p>
              <h2>Interested in working together?</h2>
              <p>Shortlist this freelancer from the matching view, then invite them to the project.</p>
              <button className="primary-button" onClick={() => onNavigate(project ? `/matches?project=${project.id}&view=${params.get('source') === 'applicants' ? 'applicants' : 'recommended'}` : '/matches') }>Back to project hiring →</button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default TalentProfilePage
