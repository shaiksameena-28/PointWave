function Footer() {
  return (
    <footer className="footer">

      <div className="footer-main">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            Point<span>Wave</span>
          </div>

          <p>
            A better way to freelance.
          </p>
        </div>


        {/* For Clients */}
        <div className="footer-column">
          <h3>For clients</h3>

          <a href="#">Find talent</a>
          <a href="#">Post a project</a>
          <a href="#">How it works</a>
        </div>


        {/* For Freelancers */}
        <div className="footer-column">
          <h3>For freelancers</h3>

          <a href="#">Find work</a>
          <a href="#">Services</a>
          <a href="#">Build your profile</a>
        </div>


        {/* Company */}
        <div className="footer-column">
          <h3>Company</h3>

          <a href="#">About</a>
          <a href="#">Help</a>
          <a href="#">Contact</a>
        </div>


        {/* Legal */}
        <div className="footer-column">
          <h3>Legal</h3>

          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Safety</a>
        </div>

      </div>


      {/* Bottom */}
      <div className="footer-bottom">

        <p>
          © 2026 PointWave
        </p>

        <p>
          Built for better freelance work.
        </p>

      </div>

    </footer>
  )
}

export default Footer