import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:5000')

export async function traceWallet(request) {
  const { address, wallet_address, ...requestFields } = request || {}
  const payload = {
    ...requestFields,
    address: address ?? wallet_address,
    mode: request?.mode === 'deep'
      ? 'live'
      : request?.mode === 'standard'
        ? 'demo'
        : request?.mode ?? 'demo',
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/api/trace`, payload, {
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    const backendData = error.response?.data
    const message = backendData?.details || backendData?.error || error.message || 'Unable to reach the trace service.'
    const traceError = new Error(message)
    traceError.status = error.response?.status
    traceError.data = backendData
    traceError.cause = error
    throw traceError
  }
}

export { API_BASE_URL }