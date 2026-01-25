import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Import Bootstrap CSS - giống base.html
import 'bootstrap/dist/css/bootstrap.min.css'
// Import Bootstrap JS for dropdowns
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// Import Font Awesome - giống base.html
import '@fortawesome/fontawesome-free/css/all.min.css'
// Import custom CSS
import './index.css'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
