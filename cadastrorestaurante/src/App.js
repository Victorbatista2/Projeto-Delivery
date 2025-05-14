import { RouterProvider, createBrowserRouter } from "react-router-dom"
import "./App.css"
import CadastroRestaurante from "./Components/CadastroRestaurante/CadastroRestaurante"
import CadastroSucesso from "./Components/CadastroSucesso/CadastroSucesso"
import LoginRestaurante from "./Components/LoginRestaurante/LoginRestaurante"

const router = createBrowserRouter([
  {
    path: "/",
    element: <CadastroRestaurante />,
  },
  {
    path: "/cadastro-sucesso",
    element: <CadastroSucesso />,
  },
  {
    path: "/login",
    element: <LoginRestaurante />,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
