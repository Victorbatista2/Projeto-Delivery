import { RouterProvider, createBrowserRouter } from "react-router-dom"
import "./App.css"
import CadastroRestaurante from "./Components/CadastroRestaurante/CadastroRestaurante"
import CadastroSucesso from "./Components/CadastroSucesso/CadastroSucesso"

const router = createBrowserRouter([
  {
    path: "/",
    element: <CadastroRestaurante />,
  },
  {
    path: "/cadastro-sucesso",
    element: <CadastroSucesso />,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
