import { useState } from 'react'

function FreelancerCard() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div
      className="freelancer-card"
      onMouseMove={handleMouseMove}
      style={{ '--mouse-x': `${mousePosition.x}%`, '--mouse-y': `${mousePosition.y}%` }}
    >
      <div className="freelancer-art" aria-hidden="true">
        <span>PW</span>
      </div>
      <div className="freelancer-card-caption">
        <span>Example profile</span>
        <span className="availability"><i /> Available this week</span>
      </div>
      <div className="freelancer-info">
        <div className="freelancer-avatar">MC</div>
        <div>
          <h3>Maya Chen</h3>
          <p>Product Designer</p>
        </div>
      </div>
      <div className="freelancer-skills">
        <span>UX Design</span><span>Figma</span><span>Research</span>
      </div>
      <div className="freelancer-stats">
        <div><strong>4.9</strong><span>Rating</span></div>
        <div><strong>42</strong><span>Projects</span></div>
        <div><strong>₹1,500</strong><span>Per hour</span></div>
      </div>
      <button type="button" className="card-link">View profile <span>→</span></button>
    </div>
  )
}

export default FreelancerCard
