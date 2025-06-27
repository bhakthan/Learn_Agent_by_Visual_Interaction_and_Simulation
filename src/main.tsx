import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App.tsx'
import "./main.css"
import "./index.css"
import "@github/spark/spark"

// Use HashRouter for GitHub Pages and environments without server-side routing support
// If the URL contains '?hash=true' or environment variable suggests GitHub Pages
const useHash = window.location.search.includes('hash=true') || 
                window.location.hostname.includes('github.io');

const Router = useHash ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
)