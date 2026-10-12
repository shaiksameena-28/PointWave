import { useMemo, useState } from 'react'
import { apiPost } from '../api/api'

const categories = [
  'Web development', 'Design & UI/UX', 'Data & software', 'Writing & content',
  'Video & creative', 'Research & presentation', 'Marketing', 'Other',
]

const timelines = ['Less than 1 week', '1–2 weeks', '2–4 weeks', '1–2 months', 'Flexible', 'Custom']

const starterSkills = [
  'React', 'JavaScript', 'UI/UX', 'Python', 'Research', 'Writing', 'Figma',
  'Data analysis', 'Node', 'PostgreSQL', 'PowerPoint', 'Biology', 'Video editing',
  'After Effects', 'YouTube', 'Pandas', 'Copywriting', 'Biotech',
]

const talent = [
  { name: 'Aarav Mehta', title: 'Full-stack developer', skills: ['React', 'JavaScript', 'Node', 'PostgreSQL'], rating: '4.9', projects: 28, categories: ['Web development', 'Data & software'], availability: 'Available now' },
  { name: 'Maya Rao', title: 'Product designer', skills: ['Figma', 'UI/UX', 'Research'], rating: '4.9', projects: 19, categories: ['Design & UI/UX', 'Research & presentation'], availability: 'Available this week' },
  { name: 'Ishaan Verma', title: 'Video editor', skills: ['Video editing', 'After Effects', 'YouTube'], rating: '4.8', projects: 31, categories: ['Video & creative'], availability: 'Available now' },
  { name: 'Sara Thomas', title: 'Research & technical writer', skills: ['Research', 'Writing', 'Biotech', 'Copywriting'], rating: '5.0', projects: 14, categories: ['Writing & content', 'Research & presentation'], availability: 'Available this week' },
]

const emptyForm = {
  title: '', description: '', category: 'Web development', skills: [], budget: '', timeline: '1–2 weeks', customTimeline: '',
}

function readProjects() {
  try { return JSON.parse(localStorage.getItem('pointwave-client-projects') || '[]') } catch { return [] }
}

function scoreTalent(person, form) {
  const required = form.skills.map((s) => s.toLowerCase())
  const matched = person.skills.filter((s) => required.includes(s.toLowerCase()))
  const skillScore = required.length ? Math.round((matched.length / required.length) * 75) : 0
  const categoryScore = person.categories.includes(form.category) ? 10 : 4
  const experienceScore = person.projects >= 25 ? 10 : person.projects >= 15 ? 8 : 6
  const availabilityScore = person.availability.includes('now') ? 5 : 4
  const score = Math.min(99, skillScore + categoryScore + experienceScore + availabilityScore)
  return { ...person, matched, score }
}

function PostProjectPage({ user, onNavigate }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [skillSearch, setSkillSearch] = useState('')
  const [error, setError] = useState('')
  const [publishedProject, setPublishedProject] = useState(null)

  const canContinue = form.title.trim() && form.description.trim() && form.skills.length > 0 && form.budget.trim() && (form.timeline !== 'Custom' || form.customTimeline.trim())
  const timelineText = form.timeline === 'Custom' ? `${form.customTimeline.trim() || 'Custom duration'} days` : form.timeline

  const filteredSkills = useMemo(() => {
    const q = skillSearch.trim().toLowerCase()
    return starterSkills.filter((skill) => !form.skills.includes(skill) && (!q || skill.toLowerCase().includes(q))).slice(0, 8)
  }, [skillSearch, form.skills])

  const matches = useMemo(() => talent.map((person) => scoreTalent(person, form)).sort((a, b) => b.score - a.score), [form])

  if (user?.role !== 'client') {
    return <main className="post-project-page"><section className="post-project-guard"><p className="section-label">Client workspace</p><h1>Project posting is for clients.</h1><p>Switch to a client account to publish a project and find the right talent.</p><button className="primary-button" onClick={() => onNavigate('/dashboard')}>Back to workspace →</button></section></main>
  }

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const toggleSkill = (skill) => setForm((current) => ({ ...current, skills: current.skills.includes(skill) ? current.skills.filter((item) => item !== skill) : [...current.skills, skill] }))

  const continueToReview = () => {
    if (!canContinue) {
      setError('Add a title, clear project details, at least one required skill, a budget and a custom duration if selected.')
      return
    }
    setError(''); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const publish = async () => {
  try {
    const project = await apiPost('/projects', {
      title: form.title,
      description: form.description,
      category: form.category,
      skills: form.skills,
      budget: form.budget,
      timeline: timelineText,
    })

    const publishedProject = {
      id: project.project._id,
      ...form,
      timeline: timelineText,
      client: user?.name || 'Your company',
      status: project.project.status,
      createdAt: project.project.createdAt,
    }

    setPublishedProject(publishedProject)
    setStep(3)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    window.history.replaceState(
      {},
      '',
      `/matches?project=${publishedProject.id}`
    )

    onNavigate(`/matches?project=${publishedProject.id}`)
  } catch (error) {
    console.error('Failed to publish project:', error)
    alert(error.message || 'Failed to publish project')
  }
}

  return (
    <main className="post-project-page">
      <div className="post-project-shell post-project-compact-shell">
        <header className="post-project-header">
          <div><p className="section-label">Client workspace</p><h1>{step === 1 ? 'Tell us what you need.' : step === 2 ? 'Review your project.' : 'Your best matches are ready.'}</h1><p>{step === 1 ? 'Keep the brief clear and focused so PointWave can find people who actually fit the work.' : step === 2 ? 'Check the brief once before publishing it to the PointWave marketplace.' : 'PointWave ranked these freelancers using the skills, category and project fit in your brief.'}</p></div>
          <button className="route-secondary-button" onClick={() => onNavigate('/dashboard')}>Save & exit</button>
        </header>

        <div className="post-project-progress">
          {[['01', 'Project details'], ['02', 'Review'], ['03', 'Recommended talent']].map(([number, label], index) => <div key={number} className={`post-step ${step === index + 1 ? 'active' : ''} ${step > index + 1 ? 'complete' : ''}`}><span>{number}</span><strong>{label}</strong></div>)}
        </div>

        {step === 1 && <section className="project-form-panel project-form-single" data-spotlight>
          <div className="form-section-heading"><span>01</span><div><p className="section-label">Project brief</p><h2>Start with the work itself.</h2></div></div>
          <div className="project-form-fields">
            <label>Project title<input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Build a responsive React website" /></label>
            <label>What do you need done?<textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the outcome, key requirements, context and anything a freelancer should know." /></label>
            <div className="form-two-col"><label>Category<select value={form.category} onChange={(e) => update('category', e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Typical budget<input value={form.budget} onChange={(e) => update('budget', e.target.value)} placeholder="e.g. ₹20,000–₹35,000" /></label></div>
            <label>Timeline<select value={form.timeline} onChange={(e) => update('timeline', e.target.value)}>{timelines.map((item) => <option key={item}>{item}</option>)}</select></label>
            {form.timeline === 'Custom' && <label className="custom-duration-field">Custom duration<input type="number" min="1" value={form.customTimeline} onChange={(e) => update('customTimeline', e.target.value)} placeholder="e.g. 15" /><small>Enter the number of days you need.</small></label>}

            <div className="skill-picker skill-picker-search">
              <div className="skill-picker-head"><div><span>Required skills</span><small>Search, choose and select as many skills as the project needs.</small></div><strong>{form.skills.length} selected</strong></div>
              <div className="skill-search-box"><span>⌕</span><input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="Search skills..." aria-label="Search required skills" /></div>
              {skillSearch && <div className="skill-suggestions">{filteredSkills.length ? filteredSkills.map((skill) => <button type="button" key={skill} onClick={() => { toggleSkill(skill); setSkillSearch('') }}>+ {skill}</button>) : <button type="button" onClick={() => { const custom = skillSearch.trim(); if (custom) toggleSkill(custom); setSkillSearch('') }}>+ Add “{skillSearch.trim()}”</button>}</div>}
              <div className="selected-skills">{form.skills.length ? form.skills.map((skill) => <button type="button" key={skill} className="selected-skill-chip" onClick={() => toggleSkill(skill)}>{skill} ×</button>) : <span className="skill-empty">No skills selected yet.</span>}</div>
              <div className="skill-quick-picks">{starterSkills.filter((skill) => !form.skills.includes(skill)).slice(0, 7).map((skill) => <button type="button" key={skill} onClick={() => toggleSkill(skill)}>+ {skill}</button>)}</div>
            </div>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions"><button className="primary-button" onClick={continueToReview}>Review project →</button></div>
        </section>}

        {step === 2 && <section className="project-review-panel compact-review" data-spotlight>
          <div className="review-top"><div><p className="section-label">02 / Review</p><h2>{form.title}</h2><p>{form.description}</p></div><span className="review-status">Ready to publish</span></div>
          <div className="review-grid"><div><span>Category</span><strong>{form.category}</strong></div><div><span>Budget</span><strong>{form.budget}</strong></div><div><span>Timeline</span><strong>{timelineText}</strong></div><div><span>Required skills</span><strong>{form.skills.join(' · ')}</strong></div></div>
          <div className="review-description"><span>Project details</span><p>{form.description}</p></div>
          <div className="review-actions"><button className="route-secondary-button" onClick={() => setStep(1)}>← Edit project</button><button className="primary-button" onClick={publish}>Publish & find matches →</button></div>
        </section>}

        {step === 3 && publishedProject && <section className="match-page" data-spotlight><div className="match-summary"><div><p className="section-label">03 / Recommended talent</p><h2>Your project is live.</h2><p>PointWave is ready to compare the right freelancers against your brief.</p></div><span className="project-status"><i></i> Project open</span></div><div className="match-project-strip"><div><span>Your project</span><strong>{publishedProject.title}</strong></div><div><span>Skills</span><strong>{publishedProject.skills.join(' · ')}</strong></div><div><span>Budget</span><strong>{publishedProject.budget}</strong></div></div><div className="phase-two-handoff"><span>Next</span><h3>See your ranked talent matches.</h3><p>Compare match scores, evidence and availability, shortlist people and invite the best fit.</p><button className="primary-button" onClick={() => onNavigate(`/matches?project=${publishedProject.id}`)}>View recommended talent →</button></div></section>}

      </div>
    </main>
  )
}

export default PostProjectPage
