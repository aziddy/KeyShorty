import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorProvider } from './lib/error-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorProvider>
      <App />
    </ErrorProvider>
  </StrictMode>,
)
