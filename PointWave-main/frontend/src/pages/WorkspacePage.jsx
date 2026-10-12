import { useMemo, useState } from 'react'

const read = (key, fallback = []) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const stageFor = (progress) => progress >= 100 ? 'Final delivery' : progress >= 75 ? 'Client review' : progress >= 40 ? 'First working version' : 'Brief confirmed'

function WorkspacePage({ user, onNavigate }) {
  const params = new URLSearchParams(window.location.search)
  const projectId = params.get('project') || ''
  const projects = read('pointwave-client-projects', [])
  const hires = read('pointwave-project-hires', [])
  const applications = read('pointwave-applications', [])
  const conversations = read('pointwave-conversations', [])
  const project = projects.find((item) => (
    String(item.id) === String(projectId) ||
    String(item.projectId) === String(projectId)
  ))
  const hire = hires.find((item) => (
    String(item.projectId) === String(projectId) ||
    String(item.id) === String(projectId)
  ))
  const application = applications.find((item) => (
    String(item.projectId) === String(projectId) &&
    (!hire || item.freelancerEmail === hire?.freelancerEmail || item.freelancerName === hire?.freelancerName || item.freelancerId === hire?.freelancerId)
  ))
  const conversation = conversations.find((item) => String(item.projectId) === String(projectId))
  const isClient = user?.role === 'client'
  const isFreelancer = user?.role === 'freelancer'
  const belongsToFreelancer = isFreelancer && hire && (hire.freelancerEmail === user?.email || hire.freelancerId === user?.email || hire.freelancerId === user?.name || hire.freelancerName === user?.name)
  const projectBelongsToClient = isClient && project && (
    project.clientEmail === user?.email ||
    project.client === user?.name ||
    project.clientName === user?.name ||
    !project.clientEmail ||
    !user?.email
  )
  const belongsToClient = isClient && hire && (
    hire.clientEmail === user?.email ||
    hire.clientName === user?.name ||
    projectBelongsToClient
  )
  const allowed = Boolean(project && hire && (belongsToClient || belongsToFreelancer))

  const [progress, setProgress] = useState(Number(hire?.progress || 0))
  const [updateText, setUpdateText] = useState('')
  const [messages, setMessages] = useState(() => conversation?.messages || (conversation?.lastMessage ? [{ id: `legacy-${projectId}`, senderEmail: conversation.clientEmail || '', senderName: conversation.clientName || 'Client', text: conversation.lastMessage, createdAt: conversation.createdAt || new Date().toISOString() }] : []))
  const [messageText, setMessageText] = useState('')
  const [activeSection, setActiveSection] = useState('overview')

  const milestones = useMemo(() => [
    ['Brief confirmed', 10],
    ['First working version', 40],
    ['Client review', 75],
    ['Final delivery', 100],
  ], [])

  if (!allowed) return <main className="workspace-page"><section className="workspace-empty"><p className="section-label">Project workspace</p><h1>Project workspace not found.</h1><p>Open a hired project from your PointWave workspace to see progress, updates and messages.</p><button className="primary-button" onClick={() => onNavigate('/dashboard?tab=projects')}>Back to projects →</button></section></main>

  const saveHire = (nextProgress) => {
    const safe = Math.max(0, Math.min(100, Number(nextProgress) || 0))
    const nextHires = hires.map((item) => String(item.projectId) === String(project.id)
      ? { ...item, progress: safe, currentStage: stageFor(safe), status: safe >= 100 ? 'Completed' : 'In progress', completedAt: safe >= 100 ? (item.completedAt || new Date().toISOString()) : item.completedAt }
      : item)
    write('pointwave-project-hires', nextHires)
    setProgress(safe)
  }

  const postUpdate = () => {
    if (!updateText.trim()) return
    const updates = read('pointwave-project-updates', [])
    const record = { id: `update-${Date.now()}`, projectId: project.id, author: user?.name || (isClient ? 'Client' : 'Freelancer'), role: user?.role || '', text: updateText.trim(), progress, createdAt: new Date().toISOString() }
    write('pointwave-project-updates', [record, ...updates])
    setUpdateText('')
  }

  const sendMessage = () => {
    if (!messageText.trim()) return
    const nextMessage = { id: `message-${Date.now()}`, senderEmail: user?.email || '', senderName: user?.name || (isClient ? 'Client' : 'Freelancer'), text: messageText.trim(), createdAt: new Date().toISOString() }
    const nextMessages = [...messages, nextMessage]
    setMessages(nextMessages)
    setMessageText('')
    const all = read('pointwave-conversations', [])
    const existing = all.find((item) => item.id === conversation?.id) || {
      id: `conversation-${project.id}-${hire.talentId}`,
      projectId: project.id,
      projectTitle: project.title,
      clientEmail: hire.clientEmail || '',
      clientName: hire.clientName || 'Client',
      freelancerEmail: hire.freelancerEmail || '',
      freelancerName: hire.freelancerName,
      createdAt: new Date().toISOString(),
    }
    const recipientIsClient = isFreelancer
    const updated = { ...existing, messages: nextMessages, lastMessage: nextMessage.text, lastMessageAt: nextMessage.createdAt, unreadCount: recipientIsClient ? 1 : 0 }
    write('pointwave-conversations', [...all.filter((item) => item.id !== updated.id), updated])
  }

  const openMessages = () => {
    const all = read('pointwave-conversations', [])
    const target = all.find((item) => String(item.projectId) === String(project.id))
    if (target) {
      const cleared = { ...target, unreadCount: 0 }
      write('pointwave-conversations', [...all.filter((item) => item.id !== target.id), cleared])
      setMessages(cleared.messages || [])
    }
    setActiveSection('messages')
  }

  const updates = read('pointwave-project-updates', []).filter((item) => String(item.projectId) === String(project.id)).slice(0, 8)
  const otherPerson = isClient ? hire.freelancerName : (hire.clientName || project.client || 'Client')

  return <main className="workspace-page">
    <div className="workspace-shell">
      <header className="workspace-header">
        <div>
          <p className="section-label">{isClient ? 'Client' : 'Freelancer'} · Project workspace</p>
          <h1>{project.title}</h1>
          <p>{isClient ? `Working with ${hire.freelancerName}.` : `Working with ${otherPerson}.`} · {hire.match}% match</p>
        </div>
        <button className="route-secondary-button" onClick={() => onNavigate('/dashboard?tab=projects')}>Back to projects</button>
      </header>

      <nav className="workspace-tabs">
        {['overview', 'progress', 'messages'].map((tab) => <button key={tab} className={activeSection === tab ? 'active' : ''} onClick={tab === 'messages' ? openMessages : () => setActiveSection(tab)}>{tab === 'messages' ? `Messages${conversation?.unreadCount ? ` · ${conversation.unreadCount}` : ''}` : tab[0].toUpperCase() + tab.slice(1)}</button>)}
      </nav>

      {activeSection === 'overview' && <div className="workspace-grid">
        <section className="workspace-card workspace-hero-card" data-spotlight>
          <div className="workspace-status-line"><span className="project-live-status">{progress >= 100 ? 'COMPLETED' : 'IN PROGRESS'}</span><strong>{progress}% complete</strong></div>
          <h2>{hire.freelancerName} is working on this project.</h2>
          <p>{project.description}</p>
          <div className="workspace-meta"><div><span>Budget</span><strong>{application?.proposedBudget || project.budget}</strong></div><div><span>Timeline</span><strong>{application?.proposedTimeline || project.timeline}</strong></div><div><span>Current stage</span><strong>{stageFor(progress)}</strong></div></div>
          <div className="workspace-progress-track"><i style={{ width: `${progress}%` }} /></div>
          <button className="primary-button" onClick={() => setActiveSection('progress')}>{isFreelancer ? 'Update my work →' : 'View project progress →'}</button>
        </section>
        <section className="workspace-card" data-spotlight>
          <p className="section-label">People</p><h2>Project team</h2>
          <div className="workspace-person"><span>Freelancer</span><strong>{hire.freelancerName}</strong><small>{application?.title || 'PointWave freelancer'} · {hire.match}% match</small></div>
          <div className="workspace-person"><span>Client</span><strong>{hire.clientName || project.client || 'Client'}</strong><small>{hire.clientEmail || 'Project owner'}</small></div>
          <button className="route-secondary-button" onClick={openMessages}>Open messages →</button>
        </section>
        <section className="workspace-card workspace-updates-card" data-spotlight>
          <div className="panel-heading"><div><p className="section-label">Work log</p><h2>Latest updates</h2></div></div>
          {updates.length ? <div className="workspace-update-list">{updates.map((item) => <article key={item.id}><div><strong>{item.author}</strong><span>{new Date(item.createdAt).toLocaleString()}</span></div><p>{item.text}</p><small>{item.progress}% complete</small></article>)}</div> : <div className="workspace-empty-inline"><strong>No work updates yet.</strong><p>{isFreelancer ? 'Use Update my work to record what you completed.' : 'The freelancer can post progress notes here as the work moves forward.'}</p></div>}
        </section>
      </div>}

      {activeSection === 'progress' && <div className="workspace-progress-layout">
        <section className="workspace-card workspace-progress-editor" data-spotlight>
          <p className="section-label">{isFreelancer ? 'Freelancer work update' : 'Project progress'}</p>
          <h2>{isFreelancer ? 'Update what you have completed.' : 'Track what the freelancer has completed.'}</h2>
          <p>{isFreelancer ? 'Move the progress to reflect the real state of the work. Add a short note so the client knows what changed.' : 'Progress is updated by the freelancer. You can see each stage and every work update here.'}</p>
          <div className="workspace-progress-number"><strong>{progress}%</strong><span>{stageFor(progress)}</span></div>
          {isFreelancer && <>
            <input className="workspace-range" type="range" min="0" max="100" step="5" value={progress} onChange={(e) => saveHire(e.target.value)} />
            <div className="workspace-range-labels"><span>0%</span><span>50%</span><span>100%</span></div>
            <label className="workspace-update-field">What did you complete?<textarea value={updateText} onChange={(e) => setUpdateText(e.target.value)} placeholder="Example: Finished the responsive homepage and connected the project navigation." /></label>
            <div className="workspace-action-row"><button className="primary-button" onClick={postUpdate}>Post work update →</button><button className="route-secondary-button" onClick={() => saveHire(Math.min(100, progress + 10))}>Quick update +10%</button></div>
          </>}
        </section>
        <aside className="workspace-card workspace-milestones">
          <p className="section-label">Milestones</p><h2>Project stages</h2>
          {milestones.map(([label, value]) => <div className={`workspace-milestone ${progress >= value ? 'done' : ''}`} key={label}><i>{progress >= value ? '✓' : '○'}</i><div><strong>{label}</strong><span>{value}%</span></div></div>)}
        </aside>
      </div>}

      {activeSection === 'messages' && <div className="workspace-message-layout">
        <section className="workspace-card workspace-message-card" data-spotlight>
          <div className="panel-heading"><div><p className="section-label">Project messages</p><h2>{otherPerson}</h2></div><span className="workspace-online-dot">Project chat</span></div>
          <div className="workspace-message-list">{messages.length ? messages.map((item) => <article className={item.senderEmail === user?.email ? 'sent' : 'received'} key={item.id}><div><strong>{item.senderName}</strong><span>{new Date(item.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div><p>{item.text}</p></article>) : <div className="workspace-empty-inline"><strong>No messages yet.</strong><p>Start the project conversation with {otherPerson}.</p></div>}</div>
          <div className="workspace-message-compose"><textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} placeholder="Write a project message…" /><button className="primary-button" onClick={sendMessage}>Send →</button></div>
        </section>
      </div>}
    </div>
  </main>
}

export default WorkspacePage
