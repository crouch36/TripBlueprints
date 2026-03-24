import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import TripPage from './TripPage.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/trips/:id" element={<TripPage />} />
      <Route path="/*" element={<App />} />
    </Routes>
  </BrowserRouter>
)
