function TrustSection() {
  const trustFeatures = [
    ['01', 'Identity', 'Know who you are working with through account and identity verification.'],
    ['02', 'Capability', 'See skills backed by portfolios, assessments and real project evidence.'],
    ['03', 'Reputation', 'Look beyond generic stars with structured reviews and work history.'],
    ['04', 'Reliability', 'See response patterns, availability and delivery history before committing.'],
    ['05', 'Payments', 'Keep agreed amounts, milestones and payment activity visible to both sides.'],
    ['06', 'Project record', 'Scope, files, changes and decisions stay connected to the actual work.'],
  ]

  return (
    <section className="trust-section" id="trust">
      <div className="trust-intro">
        <p className="section-label">Built around trust</p>
        <h2>Trust should work both ways.</h2>
        <p className="section-description">Useful signals for clients and freelancers before they commit to the work.</p>
      </div>
      <div className="medal-row">
        {trustFeatures.map(([number, title, description]) => (
          <article data-spotlight className="medal-item" key={number}>
            <div className="medal"><span>{number}</span></div>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TrustSection
