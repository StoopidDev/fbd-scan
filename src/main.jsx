import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'

// 🧠 REACT FACT #14: The Entry Point
// This is where React "mounts" — it finds the <div id="root"> in index.html
// and REPLACES it with your entire React app.
// Before React: browsers only understood HTML.
// After this line: your JavaScript components ARE the webpage.
// createRoot is the modern React 18 way of doing this.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
