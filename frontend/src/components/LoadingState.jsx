function LoadingState({ message = 'Tracing wallet...' }) {
  return (
    <div className="loading-state" role="status" aria-live="polite" aria-busy="true">
      <span className="loading-spinner" aria-hidden="true" />
      <h3>{message}</h3>
      <p>Following transaction paths and evaluating connected entities.</p>
    </div>
  )
}

export default LoadingState