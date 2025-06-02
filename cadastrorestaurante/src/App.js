import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import CadastroRestaurante from "./Components/CadastroRestaurante/CadastroRestaurante"
import CadastroSucesso from "./Components/CadastroSucesso/CadastroSucesso"
import LoginRestaurante from "./Components/LoginRestaurante/LoginRestaurante"
import DashboardParceiro from "./Components/DashboardParceiro/DashboardParceiro"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginRestaurante />} />
          <Route path="/cadastro" element={<CadastroRestaurante />} />
          <Route path="/sucesso" element={<CadastroSucesso />} />
          <Route path="/dashboard" element={<DashboardParceiro />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
