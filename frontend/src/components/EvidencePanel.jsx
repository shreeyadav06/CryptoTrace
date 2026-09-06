export default function EvidencePanel({ evidence }) {
  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="hop-sequence" style={{ marginTop: '1.25rem' }}>
      <span className="hop-sequence-label">Evidence & Reasoning Trail</span>
      <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.8rem', lineHeight: '1.8' }}>
        {evidence.map((item, index) => (
          <li key={index} style={{ marginBottom: '0.6rem' }}>
            <strong style={{ color: 'var(--primary-bright)' }}>{item.type}:</strong> {item.description}
          </li>
        ))}
      </ul>
    </div>
  )
}
