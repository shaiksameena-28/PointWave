function FinalCTA({ onLogin }) {
  return (
    <section className="final-cta" data-spotlight>
      <div><p className="section-label">Get started with PointWave</p><h2>Ready to find the right fit?</h2><p>One marketplace for finding work, hiring people and getting projects done.</p></div>
      <div className="final-cta-actions"><button className="cta-primary" type="button" onClick={onLogin}>Get started →</button><a className="cta-secondary" href="#start">Explore first</a></div>
    </section>
  )
}

export default FinalCTA
