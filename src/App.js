import { RouterProvider, createBrowserRouter } from "react-router-dom"
import "./App.css"
import HomePage from "./Components/HomePage/HomePage"
import CategoryPage from "./Components/CategoryPage/CategoryPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/categoria/:category",
    element: <CategoryPage />,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App

