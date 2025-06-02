import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginRestaurante from "./Components/LoginRestaurante/LoginRestaurante"
import CadastroRestaurante from "./Components/CadastroRestaurante/CadastroRestaurante"
import CadastroSucesso from "./Components/CadastroSucesso/CadastroSucesso"
import DashboardParceiro from "./Components/DashboardParceiro/DashboardParceiro"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota principal - Login */}
          <Route path="/" element={<LoginRestaurante />} />
          <Route path="/login" element={<LoginRestaurante />} />

          {/* Rota de cadastro */}
          <Route path="/cadastro" element={<CadastroRestaurante />} />

          {/* Rota de sucesso */}
          <Route path="/cadastro-sucesso" element={<CadastroSucesso />} />

          {/* Dashboard do parceiro */}
          <Route path="/dashboard" element={<DashboardParceiro />} />

          {/* Redirecionar qualquer rota não encontrada para login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App


