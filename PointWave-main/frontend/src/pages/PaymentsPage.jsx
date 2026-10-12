import { useMemo, useState } from 'react'

function read(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function amountValue(value) {
  const n = Number(String(value || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

function paymentStatusLabel(status) {
  return {
    pending: 'Awaiting funding',
    funded: 'Funded',
    released: 'Paid',
  }[status] || 'Awaiting funding'
}

function PaymentsPage({ user, onNavigate }) {
  const isClient = user?.role === 'client'
  const projects = read('pointwave-client-projects', [])
  const hires = read('pointwave-project-hires', [])
  const applications = read('pointwave-applications', [])
  const existingPayments = read('pointwave-payments', [])

  const relevantHires = useMemo(() => hires.filter((hire) => {
    if (isClient) {
      // A client owns the project record; use that relationship first so
      // payment records still appear when older demo hire records lack the
      // client's email/name fields.
      const ownsProject = projects.some((project) => String(project.id) === String(hire.projectId) && (
        project.clientEmail === user?.email ||
        project.client === user?.name ||
        !project.clientEmail ||
        !user?.email
      ))
      return ownsProject || hire.clientEmail === user?.email || hire.clientName === user?.name
    }
    return hire.freelancerEmail === user?.email || hire.freelancerId === user?.email || hire.freelancerName === user?.name
  }), [hires, projects, isClient, user?.email, user?.name])

  const payments = useMemo(() => {
    const next = relevantHires.map((hire) => {
      const project = projects.find((item) => String(item.id) === String(hire.projectId))
      const application = applications.find((item) => String(item.id) === String(hire.applicationId) || (String(item.projectId) === String(hire.projectId) && String(item.freelancerId || item.freelancerEmail) === String(hire.freelancerId || hire.freelancerEmail)))
      const amount = amountValue(application?.proposedBudget || project?.budget || hire.budget)
      const existing = existingPayments.find((item) => String(item.projectId) === String(hire.projectId) && String(item.freelancerEmail || item.freelancerId) === String(hire.freelancerEmail || hire.freelancerId))
      return {
        id: existing?.id || `pay-${hire.projectId}-${hire.freelancerEmail || hire.freelancerId || 'freelancer'}`,
        projectId: hire.projectId,
        projectTitle: project?.title || hire.projectTitle || 'Project',
        clientName: hire.clientName || project?.client || 'Client',
        clientEmail: hire.clientEmail || '',
        freelancerName: hire.freelancerName || 'Freelancer',
        freelancerEmail: hire.freelancerEmail || '',
        amount,
        status: existing?.status || 'pending',
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: existing?.updatedAt || new Date().toISOString(),
      }
    })
    // Keep unrelated records in storage, but only display records tied to this account.
    return next
  }, [relevantHires, projects, applications, existingPayments])

  const [selectedId, setSelectedId] = useState(null)
  const selected = payments.find((item) => item.id === selectedId) || payments[0] || null

  const persistStatus = (payment, status) => {
    const all = read('pointwave-payments', [])
    const updated = {
      ...payment,
      status,
      updatedAt: new Date().toISOString(),
    }
    const next = [...all.filter((item) => item.id !== payment.id), updated]
    write('pointwave-payments', next)
    setSelectedId(payment.id)
    // Trigger a same-tab refresh for other dashboard components that read payment state.
    window.dispatchEvent(new Event('pointwave-payments-updated'))
  }

  const summary = useMemo(() => {
    const funded = payments.filter((item) => item.status === 'funded')
    const released = payments.filter((item) => item.status === 'released')
    const pending = payments.filter((item) => item.status === 'pending')
    return {
      total: payments.reduce((sum, item) => sum + item.amount, 0),
      funded: funded.reduce((sum, item) => sum + item.amount, 0),
      released: released.reduce((sum, item) => sum + item.amount, 0),
      pending: pending.reduce((sum, item) => sum + item.amount, 0),
    }
  }, [payments])

  return (
    <main className="payments-page">
      <section className="payments-head">
        <div>
          <p className="section-label">{isClient ? 'Client payments' : 'Freelancer earnings'}</p>
          <h1>{isClient ? 'Pay for your PointWave projects.' : 'Track your PointWave earnings.'}</h1>
          <p>{isClient ? 'Fund a hired project, keep the payment tied to the work, and release it when the project is complete.' : 'See what is funded, what is still waiting, and what has been released to you.'}</p>
        </div>
        <button className="route-secondary-button" onClick={() => onNavigate('/dashboard?tab=projects')}>Back to projects</button>
      </section>

      <section className="payment-summary-grid">
        <article><span>{isClient ? 'Project value' : 'Total project value'}</span><strong>{money(summary.total)}</strong></article>
        <article><span>{isClient ? 'Funded' : 'Pending payment'}</span><strong>{money(isClient ? summary.funded : summary.funded)}</strong></article>
        <article><span>{isClient ? 'Released' : 'Paid to you'}</span><strong>{money(summary.released)}</strong></article>
      </section>

      <div className="payments-layout">
        <section className="payments-list-card">
          <div className="panel-heading">
            <div><p className="section-label">Payment activity</p><h2>{isClient ? 'Project payments' : 'Your earnings'}</h2></div>
            <span className="dashboard-count">{payments.length}</span>
          </div>
          {payments.length ? (
            <div className="payment-list">
              {payments.map((payment) => (
                <button key={payment.id} className={`payment-row ${selected?.id === payment.id ? 'active' : ''}`} onClick={() => setSelectedId(payment.id)}>
                  <div className="payment-row-main">
                    <span>{payment.projectTitle}</span>
                    <strong>{isClient ? payment.freelancerName : payment.clientName}</strong>
                  </div>
                  <div className="payment-row-side">
                    <strong>{money(payment.amount)}</strong>
                    <span className={`payment-status payment-status-${payment.status}`}>{paymentStatusLabel(payment.status)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-inline payment-empty">
              <strong>{isClient ? 'No project payments yet.' : 'No earnings yet.'}</strong>
              <p>{isClient ? 'Once you hire a freelancer, their project payment will appear here.' : 'When a client hires you, the project payment will appear here.'}</p>
              <button className="primary-button" onClick={() => onNavigate(isClient ? '/dashboard?tab=projects' : '/find-work')}>{isClient ? 'View projects →' : 'Find work →'}</button>
            </div>
          )}
          {!isClient && selected && (
            <div className="payment-timeline-card">
              <div className="panel-heading"><div><p className="section-label">Payment timeline</p><h3>{selected.projectTitle}</h3></div><span className="payment-timeline-amount">{money(selected.amount)}</span></div>
              <div className="payment-timeline-stats"><div><span>Paid so far</span><strong>{money(selected.status === 'released' ? selected.amount : 0)}</strong></div><div><span>Still pending</span><strong>{money(selected.status === 'released' ? 0 : selected.amount)}</strong></div></div>
              <div className="payment-timeline-steps">
                <div className={selected.status !== 'pending' ? 'done' : 'current'}><i>{selected.status !== 'pending' ? '✓' : '1'}</i><span>Funded</span></div>
                <div className={selected.status === 'released' ? 'done' : selected.status === 'funded' ? 'current' : ''}><i>{selected.status === 'released' ? '✓' : '2'}</i><span>Work in progress</span></div>
                <div className={selected.status === 'released' ? 'done' : ''}><i>{selected.status === 'released' ? '✓' : '3'}</i><span>Paid</span></div>
              </div>
            </div>
          )}
        </section>

        {selected && (
          <aside className="payment-detail-card" data-spotlight>
            <div className="payment-detail-top">
              <div>
                <p className="section-label">Payment details</p>
                <h2>{selected.projectTitle}</h2>
              </div>
              <span className={`payment-status payment-status-${selected.status}`}>{paymentStatusLabel(selected.status)}</span>
            </div>

            <div className="payment-amount-block">
              <span>Project amount</span>
              <strong>{money(selected.amount)}</strong>
            </div>

            <div className="payment-detail-grid">
              <div><span>Client</span><strong>{selected.clientName}</strong></div>
              <div><span>Freelancer</span><strong>{selected.freelancerName}</strong></div>
              <div><span>Payment model</span><strong>Project payment</strong></div>
              <div><span>Project status</span><strong>{selected.status === 'released' ? 'Completed & paid' : 'Active work'}</strong></div>
            </div>

            <div className="payment-flow">
              <div className={selected.status !== 'pending' ? 'done' : 'current'}><i>{selected.status !== 'pending' ? '✓' : '1'}</i><span>Fund project</span></div>
              <div className={selected.status === 'released' ? 'done' : selected.status === 'funded' ? 'current' : ''}><i>{selected.status === 'released' ? '✓' : '2'}</i><span>Work in progress</span></div>
              <div className={selected.status === 'released' ? 'done current' : ''}><i>{selected.status === 'released' ? '✓' : '3'}</i><span>Release payment</span></div>
            </div>

            <div className="payment-detail-note">
              <strong>{isClient ? 'Keep payments tied to the project.' : 'Your payment stays tied to the project.'}</strong>
              <p>{selected.status === 'pending'
                ? (isClient ? 'Fund the project before work starts. This demo keeps the payment state inside PointWave until real payment processing is connected.' : 'The client has not funded this project yet.')
                : selected.status === 'funded'
                  ? (isClient ? 'The project is funded. Release the payment after the work is completed and approved.' : 'The project is funded. Finish the work and wait for the client to release the payment.')
                  : 'Payment released. This amount is now recorded as paid in the frontend demo.'}</p>
            </div>

            <div className="payment-actions">
              <button className="route-secondary-button" onClick={() => onNavigate(`/workspace?project=${encodeURIComponent(selected.projectId)}`)}>Open project workspace →</button>
              {isClient && selected.status === 'pending' && <button className="primary-button" onClick={() => persistStatus(selected, 'funded')}>Fund project · {money(selected.amount)} →</button>}
              {isClient && selected.status === 'funded' && <button className="primary-button" onClick={() => persistStatus(selected, 'released')}>Release payment →</button>}
              {!isClient && selected.status === 'funded' && <button className="route-secondary-button" onClick={() => onNavigate(`/workspace?project=${encodeURIComponent(selected.projectId)}`)}>Update your work →</button>}
            </div>
          </aside>
        )}
      </div>
    </main>
  )
}

export default PaymentsPage
