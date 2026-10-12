function PopularServices() {
  const services = [
    ['Web development', 'Build a modern responsive website', '₹5,000', '3–5 days'],
    ['UI/UX design', 'Design a clean product experience', '₹3,500', '2–4 days'],
    ['Video editing', 'Edit engaging videos for your audience', '₹2,000', '2–3 days'],
    ['Writing', 'Create clear and compelling content', '₹1,500', '2–3 days'],
  ]

  return (
    <section className="popular-services" id="services">
      <div className="services-header">
        <div>
          <p className="section-label">Ready to go</p>
          <h2>Start with something ready to go.</h2>
          <p className="section-description">Browse focused services when you already know what you need.</p>
        </div>
        <button className="view-all-button" type="button">Browse all services →</button>
      </div>
      <div className="service-stage">
        {services.map(([category, title, price, delivery], index) => (
          <article data-spotlight className={`service-row service-row-${index + 1}`} key={category}>
            <div className="service-category">{category}</div>
            <div className="service-copy">
              <h3>{title}</h3>
              <p>{category === 'Web development' ? 'React · Next.js · Responsive' : category === 'UI/UX design' ? 'Figma · Research · Prototypes' : category === 'Video editing' ? 'Shorts · Reels · Social' : 'Blogs · Copy · Website content'}</p>
            </div>
            <div className="service-meta"><span>From <strong>{price}</strong></span><span>{delivery}</span></div>
            <span className="service-arrow">↗</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PopularServices
