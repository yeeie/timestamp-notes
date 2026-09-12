import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

function mountApp() {
  const root = document.getElementById('root')
  if (!root) return window.addEventListener('DOMContentLoaded', mountApp, { once: true })
  try {
    createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  } catch (err: any) {
    renderErrorOverlay(err)
    console.error('Mount error:', err)
  }
}

mountApp()

function renderErrorOverlay(err: any) {
  try {
    const container = document.getElementById('root') || document.body
    container.innerHTML = ''
    const pre = document.createElement('pre')
    pre.style.whiteSpace = 'pre-wrap'
    pre.style.background = '#2b2b2b'
    pre.style.color = '#f8f8f2'
    pre.style.padding = '16px'
    pre.style.fontSize = '13px'
    pre.style.lineHeight = '1.4'
    pre.style.maxHeight = '80vh'
    pre.style.overflow = 'auto'
    pre.textContent = `Runtime error:\n${err && err.stack ? err.stack : String(err)}`
    container.appendChild(pre)
  } catch (e) {
    console.error('Error rendering overlay', e)
  }
}

window.addEventListener('error', (e) => {
  console.error('window error', e.error || e.message)
  renderErrorOverlay(e.error || e.message)
})

window.addEventListener('unhandledrejection', (e) => {
  console.error('unhandledrejection', e.reason)
  renderErrorOverlay(e.reason || 'Unhandled rejection')
})
