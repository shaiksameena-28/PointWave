import { useMemo, useState } from 'react'

function readProfile() {
  try { return JSON.parse(localStorage.getItem('pointwave-profile') || '{}') } catch { return {} }
}

function readClientProjects() {
  try { return JSON.parse(localStorage.getItem('pointwave-client-projects') || '[]') } catch { return [] }
}

function readProjectHires() {
  try { return JSON.parse(localStorage.getItem('pointwave-project-hires') || '[]') } catch { return [] }
}

function readApplications() {
  try { return JSON.parse(localStorage.getItem('pointwave-applications') || '[]') } catch { return [] }
}

function readConversations() {
  try { return JSON.parse(localStorage.getItem('pointwave-conversations') || '[]') } catch { return [] }
}

function DashboardPage({ user, onNavigate, onLogout }) {
  const initialTab = new URLSearchParams(window.location.search).get('tab') || 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)
  const isClient = user?.role === 'client'
  const firstName = user?.name?.split(' ')[0] || 'there'
  const profile = readProfile()
  // Project records are shared in localStorage for the frontend demo, so freelancers
  // also need access to the project that belongs to an accepted hire.
  const clientProjects = readClientProjects()
  const projectHires = readProjectHires()
  const applications = readApplications()
  const conversations = readConversations()
  const payments = (() => { try { return JSON.parse(localStorage.getItem('pointwave-payments') || '[]') } catch { return [] } })()
  const userConversations = conversations.filter((item) => item.freelancerEmail === user?.email || item.clientEmail === user?.email || item.freelancerName === user?.name || item.clientName === user?.name)
  const unreadMessages = userConversations.reduce((total, item) => total + Number(item.unreadCount ?? (item.lastMessage ? 1 : 0)), 0)
  const freelancerApplications = applications.filter((item) => item.freelancerEmail === user?.email || item.freelancerId === user?.email || item.freelancerName === user?.name)
  const activeFreelancerHires = projectHires.filter((item) => (
    item.freelancerEmail === user?.email ||
    item.freelancerId === user?.email ||
    item.freelancerName === user?.name
  ) && String(item.status || '').toLowerCase() !== 'completed' && Number(item.progress || 0) < 100)
  const receivedApplications = isClient ? applications.filter((item) => clientProjects.some((project) => project.id === item.projectId)) : []
  const profileReady = Boolean(user?.profileCompleted)
  const clientPaymentSummary = useMemo(() => {
    if (!isClient) return { total: 0, funded: 0, released: 0, pending: 0, latest: null }
    const relevant = projectHires
      .filter((hire) => clientProjects.some((project) => String(project.id) === String(hire.projectId)))
      .map((hire) => {
        const project = clientProjects.find((item) => String(item.id) === String(hire.projectId))
        const application = applications.find((item) => String(item.id) === String(hire.applicationId) || (String(item.projectId) === String(hire.projectId) && String(item.freelancerId || item.freelancerEmail) === String(hire.freelancerId || hire.freelancerEmail)))
        const amount = Number(String(application?.proposedBudget || project?.budget || hire.budget || 0).replace(/[^0-9.]/g, '')) || 0
        const saved = payments.find((item) => String(item.projectId) === String(hire.projectId) && String(item.freelancerEmail || item.freelancerId) === String(hire.freelancerEmail || hire.freelancerId))
        return { amount, status: saved?.status || 'pending', title: project?.title || 'Project' }
      })
    return {
      total: relevant.reduce((sum, item) => sum + item.amount, 0),
      funded: relevant.filter((item) => item.status === 'funded').reduce((sum, item) => sum + item.amount, 0),
      released: relevant.filter((item) => item.status === 'released').reduce((sum, item) => sum + item.amount, 0),
      pending: relevant.filter((item) => item.status === 'pending').reduce((sum, item) => sum + item.amount, 0),
      latest: relevant[0] || null,
    }
  }, [isClient, projectHires, clientProjects, applications, payments])

  const stats = useMemo(() => isClient
    ? [[String(clientProjects.length), 'Active projects'], [String(receivedApplications.length), 'Proposals received'], [`${projectHires.length}`, 'Projects hired'], [profileReady ? 'Ready' : 'Setup', 'Profile status']]
    : [[String(projectHires.filter((item) => item.freelancerId === user?.email || item.freelancerName === user?.name).length), 'Active projects'], [String(freelancerApplications.length), 'Proposals sent'], ['₹0', 'In progress'], [profileReady ? 'Ready' : 'Setup', 'Profile status']], [isClient, profileReady, clientProjects.length, receivedApplications.length, projectHires, freelancerApplications.length, user?.email, user?.name])

  const openTab = (tab) => setActiveTab(tab)

  return (
    <main className="dashboard-page">
      <section className="dashboard-head">
        <div>
          <p className="section-label">{isClient ? 'Client workspace' : 'Freelancer workspace'}</p>
          <h1>Good morning, {firstName}.</h1>
          <p>{isClient ? 'Keep hiring moving and stay close to the work.' : 'Keep your work moving and stay close to the opportunities that fit.'}</p>
        </div>
        <div className="dashboard-head-actions">
          <button className="route-secondary-button" onClick={() => onNavigate(isClient ? '/find-talent' : '/find-work')}>{isClient ? 'Find talent' : 'Find work'}</button>
          {(!user?.profileCompleted || isClient) && <button className="primary-button" onClick={() => onNavigate(isClient ? '/post-project' : '/onboarding')}>{isClient ? 'Post a project' : 'Complete profile'} →</button>}
        </div>
      </section>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-head">
            <span>Workspace</span>
            <i aria-hidden="true"></i>
          </div>
          <div className="dashboard-nav-group">
          <button className={activeTab === 'overview' ? 'dashboard-nav active' : 'dashboard-nav'} onClick={() => openTab('overview')}>Overview</button>
          <button className="dashboard-nav" onClick={() => onNavigate(isClient ? '/find-talent' : '/find-work')}>{isClient ? 'Find talent' : 'Find work'}</button>
          <button className="dashboard-nav" onClick={() => openTab('projects')}>Projects</button>
          <button className="dashboard-nav" onClick={() => { const all = readConversations(); const cleared = all.map((item) => (item.freelancerEmail === user?.email || item.clientEmail === user?.email || item.freelancerName === user?.name || item.clientName === user?.name) ? { ...item, unreadCount: 0 } : item); localStorage.setItem('pointwave-conversations', JSON.stringify(cleared)); openTab('messages') }}>Messages <span>{unreadMessages}</span></button>
          <button className="dashboard-nav" onClick={() => openTab('proposals')}>Proposals</button>
          <button className="dashboard-nav" onClick={() => onNavigate('/payments')}>Payments</button>
          <button className={activeTab === 'profile' ? 'dashboard-nav active' : 'dashboard-nav'} onClick={() => openTab('profile')}>Profile</button>
          <button className={activeTab === 'settings' ? 'dashboard-nav active' : 'dashboard-nav'} onClick={() => openTab('settings')}>Settings</button>
          </div>
          <button
            className="dashboard-nav logout"
            onClick={onLogout}
            style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '7px 11px', marginTop: 'auto', paddingTop: 7 }}
          >Log out</button>
        </aside>

        <section className="dashboard-content">
          {activeTab === 'overview' && <>
            <div className="dashboard-stats">
              {stats.map(([value, label]) => <div className="dashboard-stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}
            </div>
            <div className="dashboard-grid">
              <section className="dashboard-panel dashboard-projects">
                <div className="panel-heading"><div><p className="section-label">Projects</p><h2>{isClient ? 'Your projects' : 'Your active work'}</h2></div><button onClick={() => openTab('projects')}>View all →</button></div>
                {isClient && clientProjects.length ? (
                  <div className="client-project-list">
                    {clientProjects.slice(0, 3).map((project) => (
                      <article key={project.id} className="client-project-card" data-spotlight>
                        {(() => {
                          const hire = projectHires.find((item) => item.projectId === project.id)
                          const progress = Number(hire?.progress || 0)
                          return <>
                            <div className="client-project-main">
                              <div className="client-project-kicker"><span>{project.category}</span>{hire ? <b className="project-live-status">IN PROGRESS</b> : <b>OPEN</b>}</div>
                              <h3>{project.title}</h3>
                              <p>{project.description}</p>
                              <div className="client-project-tags">{project.skills.slice(0, 4).map((skill) => <i key={skill}>{skill}</i>)}</div>
                              {hire && <div className="project-progress-summary"><div><span>Hired</span><strong>{hire.freelancerName}</strong></div><div><span>Completed</span><strong>{progress}%</strong></div><div className="project-progress-track"><i style={{width:`${progress}%`}} /></div></div>}
                            </div>
                            <div className="client-project-side"><strong>{project.budget}</strong><small>{project.timeline}</small><em className={hire ? 'hired-status' : ''}>{hire ? 'Freelancer hired' : (project.status || 'OPEN')}</em><button className="mini-project-match" onClick={() => onNavigate(hire ? `/workspace?project=${encodeURIComponent(project.id)}` : `/matches?project=${project.id}&view=applicants`)}>{hire ? 'Open workspace →' : 'View applicants →'}</button></div>
                          </>
                        })()}
                      </article>
                    ))}
                    <button className="route-secondary-button" onClick={() => onNavigate('/post-project')}>Post another project →</button>
                  </div>
                ) : !isClient && activeFreelancerHires.length ? (
                  <div className="dashboard-project-links overview-active-project-links">
                    {activeFreelancerHires.slice(0, 3).map((hire) => {
                      const project = clientProjects.find((item) => String(item.id) === String(hire.projectId))
                      if (!project) return null
                      return (
                        <button key={hire.projectId} onClick={() => onNavigate(`/workspace?project=${encodeURIComponent(project.id)}`)}>
                          <span>{project.category} · {Number(hire.progress || 0)}% complete</span>
                          <strong>{project.title}</strong>
                          <small>Client: {hire.clientName || project.client || 'PointWave client'} · {hire.currentStage || 'In progress'} →</small>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="empty-projects">
                    <div className="empty-project-mark">0</div>
                    <div><h3>{isClient ? 'No projects yet.' : 'No active projects yet.'}</h3><p>{isClient ? 'Start with a clear brief and your first project will appear here.' : 'Your active work will appear here after a client hires you.'}</p></div>
                    <button className="primary-button" onClick={() => onNavigate(isClient ? '/post-project' : '/find-work')}>{isClient ? 'Post your first project →' : 'Find your first project →'}</button>
                  </div>
                )}
              </section>
              <section className="dashboard-panel dashboard-focus profile-essentials" data-spotlight>
                <p className="section-label">Profile essentials</p>
                <h2>{profileReady ? 'Ready to be discovered.' : 'Finish the essentials.'}</h2>
                <p>{isClient ? 'Keep your hiring context clear so the right freelancers can understand what you need.' : 'Give clients enough evidence to understand your skills before they open your profile.'}</p>
                <div className="profile-checklist">
                  {(isClient ? [['Hiring type', profile.workType], ['Industry', profile.industry], ['Budget', profile.budget], ['About', profile.bio]] : [['Skills', profile.skills], ['Resume', profile.resumeCreated || profile.resumeName], ['Previous work', profile.projects?.length], ['Links', profile.linkedin || profile.github || profile.youtube]]).map(([label, value]) => <span key={label} className={value ? 'done' : ''}><i>{value ? '✓' : '○'}</i>{label}</span>)}
                </div>
                {isClient && clientPaymentSummary.latest && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <p className="section-label" style={{ marginBottom: 6 }}>Payment activity</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
                      <div><span style={{ display: 'block', fontSize: 9, color: 'var(--muted-text)' }}>PROJECT VALUE</span><strong style={{ fontSize: 14 }}>₹{clientPaymentSummary.total.toLocaleString('en-IN')}</strong></div>
                      <div><span style={{ display: 'block', fontSize: 9, color: 'var(--muted-text)' }}>FUNDED</span><strong style={{ fontSize: 14 }}>₹{clientPaymentSummary.funded.toLocaleString('en-IN')}</strong></div>
                      <div><span style={{ display: 'block', fontSize: 9, color: 'var(--muted-text)' }}>RELEASED</span><strong style={{ fontSize: 14 }}>₹{clientPaymentSummary.released.toLocaleString('en-IN')}</strong></div>
                    </div>
                    <small style={{ display: 'block', marginTop: 7, color: 'var(--muted-text)' }}>{clientPaymentSummary.latest.title} · {clientPaymentSummary.pending ? 'Awaiting funding' : clientPaymentSummary.funded ? 'Funded' : 'Paid'}</small>
                  </div>
                )}
                <button className="text-action" onClick={() => openTab('profile')}>{profileReady ? 'View your profile →' : 'Complete your profile →'}</button>
              </section>
            </div>
          </>}

          {activeTab === 'profile' && <section className="dashboard-panel profile-panel profile-panel-full">
            <div className="panel-heading"><div><p className="section-label">Profile</p><h2>{user?.name || 'Your profile'}</h2></div><button onClick={() => onNavigate('/onboarding')}>Edit profile →</button></div>
            <div className="profile-identity-card">
              <div className="profile-avatar profile-avatar-lg">{profile.profilePhoto ? <img src={profile.profilePhoto} alt="Your profile" /> : (user?.name || 'P').trim().charAt(0).toUpperCase()}</div>
              <div><span className="section-label">Profile photo</span><strong>{profile.profilePhoto ? 'Photo added' : 'No photo added yet'}</strong><small>Use Edit profile to upload or replace it.</small></div>
            </div>
            <div className="profile-grid">
              <div><span>Account</span><strong>{user?.email || '—'}</strong></div>
              <div><span>Role</span><strong>{isClient ? 'Client / hiring' : 'Freelancer / talent'}</strong></div>
              <div><span>{isClient ? 'Hiring type' : 'Professional title'}</span><strong>{isClient ? (profile.workType || 'Not set') : (profile.title || 'Not set')}</strong></div>
              <div><span>{isClient ? 'Industry' : 'Experience'}</span><strong>{isClient ? (profile.industry || 'Not set') : (profile.experience || 'Not set')}</strong></div>
              <div className="profile-wide"><span>About</span><p>{profile.bio || 'Complete your profile to add your professional information.'}</p></div>
              {!isClient && <div className="profile-wide"><span>Skills</span><p>{profile.skills || 'No skills added yet.'}</p></div>}
              {!isClient && <div><span>Education</span><strong>{profile.education || 'Not set'}</strong></div>}
              {!isClient && <div><span>Availability</span><strong>{profile.availability || 'Not set'}</strong></div>}
              {!isClient && <div className="profile-wide"><span>Resume</span>{profile.resumeDataUrl ? <p><a className="profile-resume-link" href={profile.resumeDataUrl} target="_blank" rel="noreferrer">✓ {profile.resumeName || 'Open uploaded resume'} ↗</a></p> : <p>{profile.resumeCreated ? `✓ ${profile.resumeHeadline || 'PointWave resume created'}` : profile.resumeName ? `✓ ${profile.resumeName}` : 'No resume uploaded yet.'}</p>}</div>}
              {!isClient && <div className="profile-wide"><span>Previous work</span><div className="profile-projects">{profile.projects?.length ? profile.projects.map((project, i) => <article key={i}><strong>{project.title}</strong><p>{project.description}</p>{project.link && <small>{project.link}</small>}</article>) : <p>No showcase projects added yet.</p>}</div></div>}
              <div className="profile-wide"><span>Connected links</span><div className="profile-links"><span>{profile.linkedin ? `LinkedIn · ${profile.linkedin}` : 'LinkedIn not connected'}</span><span>{profile.github ? `${isClient ? 'Website' : 'GitHub'} · ${profile.github}` : `${isClient ? 'Website' : 'GitHub'} not connected`}</span><span>{profile.youtube ? `YouTube · ${profile.youtube}` : 'YouTube not connected'}</span></div></div>
            </div>
          </section>}

          {activeTab === 'projects' && <section className="dashboard-panel dashboard-placeholder dashboard-projects-tab">
            <div className="panel-heading"><div><p className="section-label">Projects</p><h2>{isClient ? 'Your hiring projects' : 'Your active work'}</h2></div></div>
            {isClient ? (clientProjects.length ? <div className="dashboard-project-links">{clientProjects.map((project) => { const hire = projectHires.find((item) => item.projectId === project.id); return <button key={project.id} onClick={() => onNavigate(hire ? `/workspace?project=${encodeURIComponent(project.id)}` : `/matches?project=${project.id}&view=applicants`)}><span>{project.category} · {hire ? `${hire.progress || 0}% complete` : 'Open'}</span><strong>{project.title}</strong><small>{hire ? `Hired: ${hire.freelancerName} · ${hire.currentStage || 'Open workspace'} →` : `${project.skills.slice(0,3).join(' · ')} · View applicants →`}</small></button> })}</div> : <div className="dashboard-empty-inline"><strong>No projects yet.</strong><p>Post a project when you are ready to start hiring.</p><button className="primary-button" onClick={() => onNavigate('/post-project')}>Post a project →</button></div>) : (() => { const activeHires = activeFreelancerHires; return activeHires.length ? <div className="dashboard-project-links">{activeHires.map((hire) => { const project = clientProjects.find((item) => item.id === hire.projectId); return project ? <button key={hire.projectId} onClick={() => onNavigate(`/workspace?project=${encodeURIComponent(project.id)}`)}><span>{project.category} · {hire.progress || 0}% complete</span><strong>{project.title}</strong><small>Client: {hire.clientName || project.client || 'PointWave client'} · {hire.currentStage || 'In progress'} →</small></button> : null })}</div> : <div className="dashboard-empty-inline"><strong>No active projects yet.</strong><p>Once a client accepts your proposal, the project workspace will appear here.</p><button className="primary-button" onClick={() => onNavigate('/find-work')}>Find work →</button></div> })()}
          </section>}
          {activeTab === 'messages' && <section className="dashboard-panel dashboard-placeholder">
            <div className="panel-heading"><div><p className="section-label">Messages</p><h2>Project conversations</h2></div></div>
            {userConversations.length ? <div className="dashboard-conversation-list">{userConversations.map((item) => item.freelancerEmail === user?.email || item.clientEmail === user?.email || item.freelancerName === user?.name || item.clientName === user?.name).map((item) => <article key={item.id} className="dashboard-conversation-card"><div><span>{item.projectTitle}</span><strong>{isClient ? item.freelancerName : item.clientName}</strong><p>{item.lastMessage || 'Your project conversation is ready.'}</p></div><button className="route-secondary-button" onClick={() => onNavigate(`/workspace?project=${encodeURIComponent(item.projectId)}`)}>Open project →</button></article>)}</div> : <div className="dashboard-empty-inline"><strong>Your project conversations will appear here.</strong><p>Once a client hires you, or you hire a freelancer, PointWave creates a project conversation.</p><button className="route-secondary-button" onClick={() => openTab(isClient ? 'projects' : 'proposals')}>Go to {isClient ? 'projects' : 'proposals'} →</button></div>}
          </section>}
          {activeTab === 'proposals' && <section className="dashboard-panel dashboard-placeholder">
            <div className="panel-heading"><div><p className="section-label">Proposals</p><h2>{isClient ? 'Proposals received' : 'Your proposals'}</h2></div><span className="dashboard-count">{isClient ? receivedApplications.length : freelancerApplications.length}</span></div>
            {(isClient ? receivedApplications : freelancerApplications).length ? <div className="dashboard-proposal-list">{(isClient ? receivedApplications : freelancerApplications).map((item) => <article className="dashboard-proposal-card" key={item.id}><div className="proposal-card-main"><span>{item.projectTitle}</span><h3>{isClient ? item.freelancerName : item.client}</h3><p>{isClient ? item.title : `${item.match || 0}% match · ${item.proposedTimeline || 'Timeline pending'}`}</p></div><div className="proposal-card-status"><strong>{item.match || 0}%</strong><span className={`proposal-status status-${String(item.status || 'Submitted').toLowerCase().replace(/\s+/g,'-')}`}>{item.status || 'Submitted'}</span></div><div className="proposal-card-actions">{isClient ? <><button className="route-secondary-button" onClick={() => onNavigate(`/proposal?project=${item.projectId}&application=${item.id}&view=client`)}>View proposal</button><button className="primary-button" onClick={() => onNavigate(`/talent-profile?talent=${encodeURIComponent(item.freelancerId)}&project=${encodeURIComponent(item.projectId)}&source=applicants`)}>View profile →</button></> : <button className="route-secondary-button" onClick={() => onNavigate(item.status === 'Accepted' ? `/workspace?project=${encodeURIComponent(item.projectId)}` : `/project?project=${encodeURIComponent(item.projectId)}`)}>{item.status === 'Accepted' ? 'Open workspace →' : 'View project →'}</button>}</div></article>)}</div> : <div className="dashboard-empty-inline"><strong>{isClient ? 'No proposals received yet.' : 'No proposals sent yet.'}</strong><p>{isClient ? 'When freelancers apply, their proposals will appear here.' : 'Find a project that fits and send your first proposal.'}</p><button className="primary-button" onClick={() => onNavigate(isClient ? '/post-project' : '/find-work')}>{isClient ? 'Post a project →' : 'Find work →'}</button></div>}
          </section>}
          {activeTab === 'settings' && <section className="dashboard-panel dashboard-placeholder"><p className="section-label">Settings</p><h2>Account settings</h2><p>Theme, notifications, security and account controls will live here as the marketplace grows.</p><button className="route-secondary-button" onClick={() => openTab('overview')}>Back to overview</button></section>}
        </section>
      </div>
    </main>
  )
}

export default DashboardPage
