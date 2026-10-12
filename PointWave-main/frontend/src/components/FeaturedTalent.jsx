function FeaturedTalent({ role }) {
  const people = [
    ['MC', 'Maya Chen', 'Product Designer', 'UX Design · Figma · Research', '4.9', '42 projects'],
    ['AR', 'Arjun Rao', 'Full Stack Developer', 'React · Node.js · APIs', '4.8', '37 projects'],
    ['NS', 'Nisha Shah', 'Brand Designer', 'Branding · Visual identity · Figma', '4.9', '31 projects'],
    ['DK', 'Dev Kumar', 'Data Analyst', 'Python · SQL · Dashboards', '4.8', '28 projects'],
    ['SK', 'Sara Khan', 'Content Strategist', 'Writing · SEO · Research', '4.9', '26 projects'],
  ]

  const title = role === 'client'
    ? 'People who know their work.'
    : role === 'freelancer'
      ? 'Projects worth looking at.'
      : 'People who know their work.'

  if (role === 'freelancer') {
    return (
      <section className="featured-talent" id="work">
        <div className="featured-header">
          <div>
            <p className="section-label">For freelancers</p>
            <h2>{title}</h2>
            <p className="section-description">A preview of the kind of work you’ll discover once we know what you’re looking for.</p>
          </div>
          <button className="view-all-button" type="button">View projects →</button>
        </div>
        <div className="project-preview" data-spotlight>
          <div><span className="project-kicker">Example project</span><h3>Build a research dashboard</h3><p>React · Python · Data visualization</p></div>
          <div className="project-side"><strong>₹35k–₹50k</strong><span>Client verified · 4.8 ★</span></div>
          <button type="button">View project →</button>
        </div>
      </section>
    )
  }

  return (
    <section className="featured-talent" id="talent">
      <div className="featured-header">
        <div>
          <p className="section-label">For clients</p>
          <h2>{title}</h2>
          <p className="section-description">A small look at the kind of evidence you’ll see before choosing someone.</p>
        </div>
        <button className="view-all-button" type="button">View all talent →</button>
      </div>
      <div className="small-talent-grid">
        {people.map(([initials, name, roleName, skills, rating, projects]) => (
          <article data-spotlight className="small-talent-card" key={name}>
            <div className="small-talent-top">
              <div className="small-avatar">{initials}</div>
              <span className="small-rating">★ {rating}</span>
            </div>
            <div className="small-talent-main">
              <h3>{name}</h3>
              <p>{roleName}</p>
              <small>{skills}</small>
            </div>
            <div className="small-talent-footer"><span>{projects}</span><button type="button">View profile →</button></div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default FeaturedTalent
