function HowItWorks() {
  const steps = [
    ['01', 'Tell us what you need', 'Describe your project, skills, budget and timeline.'],
    ['02', 'Find the right fit', 'See relevant people or projects with useful evidence behind them.'],
    ['03', 'Agree on the work', 'Keep scope, milestones, deadlines and price clear from the start.'],
    ['04', 'Get it done', 'Work together with tasks, files, messages and deliverables in one place.'],
    ['05', 'Build your reputation', 'Complete the work and build a track record from real project experience.'],
    ['06', 'Keep improving', 'Use feedback, project history and new experience to make the next project better.'],
  ]

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="section-heading compact-heading">
        <p className="section-label">How PointWave works</p>
        <h2>Good work shouldn’t be complicated.</h2>
        <p className="section-description">A clearer path from finding the right fit to finishing the project.</p>
      </div>
      <div className="steps-list">
        {steps.map(([number, title, description], index) => (
          <article data-spotlight className={`step-band ${[0, 3, 4].includes(index) ? 'step-orange' : 'step-neutral'}`} key={number}>
            <span className="step-number">{number}</span>
            <div><h3>{title}</h3><p>{description}</p></div>
            <span className="step-mark">→</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
