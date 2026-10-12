import { useEffect, useState } from 'react'

const emptyProject = { title: '', description: '', link: '' }

function OnboardingPage({ user, onComplete, onNavigate }) {
  const isClient = user?.role === 'client'
  const [bio, setBio] = useState('')
  const [title, setTitle] = useState('')
  const [skills, setSkills] = useState('')
  const [experience, setExperience] = useState('')
  const [education, setEducation] = useState('')
  const [availability, setAvailability] = useState('Available now')
  const [workType, setWorkType] = useState('One-time project')
  const [industry, setIndustry] = useState('')
  const [company, setCompany] = useState('')
  const [budget, setBudget] = useState('')
  const [resumeName, setResumeName] = useState('')
  const [resumeDataUrl, setResumeDataUrl] = useState('')
  const [profilePhoto, setProfilePhoto] = useState('')
  const [resumeMode, setResumeMode] = useState('upload')
  const [resumeHeadline, setResumeHeadline] = useState('')
  const [resumeSummary, setResumeSummary] = useState('')
  const [resumeExperience, setResumeExperience] = useState('')
  const [resumeEducation, setResumeEducation] = useState('')
  const [projects, setProjects] = useState([emptyProject, emptyProject])
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [youtube, setYoutube] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pointwave-profile') || 'null')
      if (!saved) return
      setBio(saved.bio || '')
      setTitle(saved.title || '')
      setSkills(saved.skills || '')
      setExperience(saved.experience || '')
      setEducation(saved.education || '')
      setAvailability(saved.availability || 'Available now')
      setWorkType(saved.workType || 'One-time project')
      setIndustry(saved.industry || '')
      setCompany(saved.company || '')
      setBudget(saved.budget || '')
      setResumeName(saved.resumeName || '')
      setResumeDataUrl(saved.resumeDataUrl || '')
      setProfilePhoto(saved.profilePhoto || '')
      setResumeMode(saved.resumeCreated ? 'create' : 'upload')
      setResumeHeadline(saved.resumeHeadline || '')
      setResumeSummary(saved.resumeSummary || '')
      setResumeExperience(saved.resumeExperience || '')
      setResumeEducation(saved.resumeEducation || '')
      setProjects(saved.projects?.length ? saved.projects : [emptyProject, emptyProject])
      setLinkedin(saved.linkedin || '')
      setGithub(saved.github || '')
      setYoutube(saved.youtube || '')
    } catch {}
  }, [])

  const updateProject = (index, key, value) => setProjects((current) => current.map((project, i) => i === index ? { ...project, [key]: value } : project))

  const save = (event) => {
    event.preventDefault()
    setError('')
    if (!isClient && !bio.trim()) return setError('Add a short professional bio.')
    if (!isClient && !skills.trim()) return setError('Add at least a few skills.')
    if (!isClient && resumeMode === 'upload' && !resumeName) return setError('Upload your resume PDF or choose “Create a resume instead”.')
    if (!isClient && resumeMode === 'create' && !resumeHeadline.trim()) return setError('Add a headline for your created resume.')
    if (isClient && !workType) return setError('Choose the type of work you usually need.')

    const profile = {
      bio: bio.trim(), title: title.trim(), skills: skills.trim(), experience, education, availability,
      workType, industry: industry.trim(), company: company.trim(), budget: budget.trim(), resumeName, resumeDataUrl, profilePhoto,
      resumeCreated: !isClient && resumeMode === 'create', resumeHeadline: resumeHeadline.trim(), resumeSummary: resumeSummary.trim(),
      resumeExperience: resumeExperience.trim(), resumeEducation: resumeEducation.trim(),
      projects: projects.filter((project) => project.title.trim()), linkedin: linkedin.trim(), github: github.trim(), youtube: youtube.trim(), completed: true,
    }
    localStorage.setItem('pointwave-profile', JSON.stringify(profile))
    onComplete(profile)
  }

  const handleResume = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') return setError('Please upload a PDF resume.')
    if (file.size > 5 * 1024 * 1024) return setError('Resume must be 5 MB or smaller.')
    const reader = new FileReader()
    reader.onload = () => {
      setResumeName(file.name)
      setResumeDataUrl(String(reader.result || ''))
      setResumeMode('upload')
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleProfilePhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Please upload a JPG, PNG or WebP image.')
    if (file.size > 3 * 1024 * 1024) return setError('Profile photo must be 3 MB or smaller.')
    const reader = new FileReader()
    reader.onload = () => { setProfilePhoto(String(reader.result || '')); setError('') }
    reader.readAsDataURL(file)
  }

  const removeProfilePhoto = () => setProfilePhoto('')

  return (
    <main className="onboarding-page">
      <div className="onboarding-shell onboarding-expanded">
        <div className="onboarding-copy">
          <p className="section-label">{isClient ? 'Hiring setup' : 'Freelancer setup'}</p>
          <h1>{isClient ? 'Tell us what you need.' : 'Build your work profile.'}</h1>
          <p>{isClient ? 'Give freelancers enough context to understand the kind of work you want to hire for.' : 'Give clients evidence they can trust: skills, resume, previous work and the places they can verify you.'}</p>
          <div className="onboarding-step"><span>01</span><strong>Account created</strong></div>
          <div className="onboarding-step active"><span>02</span><strong>{isClient ? 'Hiring preferences' : 'Profile + evidence'}</strong></div>
          <div className="onboarding-step"><span>03</span><strong>Start using PointWave</strong></div>
          <div className="onboarding-evidence"><span>{isClient ? 'HIRING SIGNALS' : 'PROFILE SIGNALS'}</span><p>{isClient ? 'Work type · Industry · Budget · Hiring context' : 'Resume · Skills · Previous work · Social proof'}</p></div>
        </div>

        <form className="onboarding-form onboarding-scroll-form" onSubmit={save}>
          <div className="onboarding-form-head">
            <div><p className="section-label">Profile</p><h2>{user?.name || 'Your account'}</h2></div>
            <span className="onboarding-role">{isClient ? 'Client' : 'Freelancer'}</span>
          </div>

          <div className="profile-photo-editor">
            <div className="profile-photo-preview">
              {profilePhoto ? <img src={profilePhoto} alt="Profile preview" /> : <span>{(user?.name || 'P').trim().charAt(0).toUpperCase()}</span>}
            </div>
            <div className="profile-photo-copy">
              <span className="section-label">Profile photo</span>
              <strong>{profilePhoto ? 'Your photo is ready.' : 'Add a profile photo.'}</strong>
              <small>Shown on your profile, proposals, messages and talent views.</small>
              <div className="profile-photo-actions">
                <label className="route-secondary-button">{profilePhoto ? 'Replace photo' : 'Upload photo'}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleProfilePhoto} /></label>
                {profilePhoto && <button type="button" className="route-secondary-button" onClick={removeProfilePhoto}>Remove</button>}
              </div>
            </div>
          </div>

          {!isClient ? (
            <>
              <div className="onboarding-two"><label>Professional title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full-stack developer" /></label><label>Experience<select value={experience} onChange={(e) => setExperience(e.target.value)}><option value="">Select</option><option>Entry level</option><option>1–3 years</option><option>3–5 years</option><option>5+ years</option></select></label></div>
              <label>About you<textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What do you do and what kind of work are you best at?" /></label>
              <div className="onboarding-two"><label>Skills<input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Python, UI/UX" /></label><label>Education<input value={education} onChange={(e) => setEducation(e.target.value)} placeholder="Degree / university" /></label></div>
              <label>Availability<select value={availability} onChange={(e) => setAvailability(e.target.value)}><option>Available now</option><option>Part-time</option><option>Not available</option></select></label>

              <div className="onboarding-section-title"><div><span className="section-label">Resume</span><strong>Show clients how you work.</strong></div><div className="resume-mode"><button type="button" className={resumeMode === 'upload' ? 'active' : ''} onClick={() => setResumeMode('upload')}>Upload PDF</button><button type="button" className={resumeMode === 'create' ? 'active' : ''} onClick={() => setResumeMode('create')}>Create one</button></div></div>
              {resumeMode === 'upload' ? (
                <label className="upload-box">Resume (PDF)<input type="file" accept="application/pdf,.pdf" onChange={handleResume} /><span>{resumeName ? `✓ ${resumeName}` : 'Choose a PDF up to 5 MB'}</span></label>
              ) : (
                <div className="resume-builder"><div className="onboarding-two"><label>Resume headline<input value={resumeHeadline} onChange={(e) => setResumeHeadline(e.target.value)} placeholder="Biotechnology student & aspiring developer" /></label><label>Resume education<input value={resumeEducation} onChange={(e) => setResumeEducation(e.target.value)} placeholder="Degree, college, year" /></label></div><label>Resume summary<textarea value={resumeSummary} onChange={(e) => setResumeSummary(e.target.value)} placeholder="A short summary for your resume." /></label><label>Experience / projects<textarea value={resumeExperience} onChange={(e) => setResumeExperience(e.target.value)} placeholder="Internships, projects, achievements or relevant work." /></label><button type="button" className="route-secondary-button resume-print" onClick={() => window.print()}>Preview / print as PDF</button></div>
              )}

              <div className="onboarding-section-title"><div><span className="section-label">Previous work</span><strong>Showcase projects that help you get hired.</strong></div><span className="small-hint">Up to 2 for now</span></div>
              <div className="portfolio-mini-grid">{projects.map((project, index) => <div className="portfolio-mini" key={index}><span>PROJECT {String(index + 1).padStart(2, '0')}</span><input value={project.title} onChange={(e) => updateProject(index, 'title', e.target.value)} placeholder="Project title" /><textarea value={project.description} onChange={(e) => updateProject(index, 'description', e.target.value)} placeholder="What did you build or achieve?" /><input value={project.link} onChange={(e) => updateProject(index, 'link', e.target.value)} placeholder="Live/demo link (optional)" /></div>)}</div>

              <div className="onboarding-section-title"><div><span className="section-label">Social proof</span><strong>Connect accounts clients can verify.</strong></div></div>
              <div className="social-input-grid"><label>LinkedIn<input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/you" /></label><label>GitHub<input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="github.com/you" /></label><label>YouTube<input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="youtube.com/@you" /></label></div>
            </>
          ) : (
            <>
              <div className="onboarding-two"><label>Company / client name<input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company or your name" /></label><label>Industry<input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Health tech" /></label></div>
              <label>What are you hiring for?<select value={workType} onChange={(e) => setWorkType(e.target.value)}><option>One-time project</option><option>Ongoing work</option><option>Part-time support</option><option>Long-term contract</option><option>Multiple projects</option></select></label>
              <div className="onboarding-two"><label>Typical budget<input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. ₹10k–₹50k" /></label><label>Hiring focus<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Designers + developers" /></label></div>
              <label>Hiring context<textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What kind of people or outcomes do you usually need?" /></label>
              <div className="onboarding-section-title"><div><span className="section-label">Company links</span><strong>Optional verification and context.</strong></div></div>
              <div className="social-input-grid"><label>LinkedIn<input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/company/you" /></label><label>Website<input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="yourcompany.com" /></label><label>YouTube<input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="youtube.com/@company" /></label></div>
            </>
          )}

          {error && <p className="auth-error" role="alert">{error}</p>}
          <div className="onboarding-actions"><button type="button" className="route-secondary-button" onClick={() => onNavigate('/dashboard')}>Save for later</button><button type="submit" className="primary-button">Save profile & continue →</button></div>
        </form>
      </div>
    </main>
  )
}

export default OnboardingPage
