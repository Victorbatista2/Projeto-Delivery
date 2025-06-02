"use client"

import { useState, useEffect } from "react"
import { useApp } from "../../contexts/AppContext"
import LoadingSpinner from "../../shared/LoadingSpinner"
import "./LoginRegister.css"

const LoginRegister = () => {
  const { state, actions } = useApp()
  const [formState, setFormState] = useState("Login")
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    senha: "",
  })

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      document.body.appendChild(script)

      script.onload = () => {
        window.google?.accounts.id.initialize({
          client_id: "474311907571-g0d6vjrjgatf3d0b7do9fq6cm9u5par1.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        })
      }
    }

    loadGoogleScript()
    loadFacebookSDK()
  }, [])

  const loadFacebookSDK = () => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: "2406762519701766",
        cookie: true,
        xfbml: true,
        version: "v17.0",
      })
    }
    ;((d, s, id) => {
      let js,
        fjs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) return
      js = d.createElement(s)
      js.id = id
      js.src = "https://connect.facebook.net/en_US/sdk.js"
      fjs.parentNode.insertBefore(js, fjs)
    })(document, "script", "facebook-jssdk")
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (formState === "Sign Up") {
        await actions.register(formData)
        setFormState("Login")
        setFormData({ ...formData, nome: "", telefone: "" })
      } else {
        await actions.login({
          email: formData.email,
          senha: formData.senha,
        })
      }
    } catch (error) {
      console.error("Login/Register error:", error)
    }
  }

  const handleGoogleLogin = () => {
    window.google?.accounts.id.prompt()
  }

  const handleGoogleResponse = async (response) => {
    try {
      const result = await fetch("http://localhost:3001/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      })

      const data = await result.json()
      if (!result.ok) throw new Error(data.message || "Falha no login com Google")

      // Simular login bem-sucedido
      actions.login({ email: data.usuario.email, senha: "google_auth" })
    } catch (error) {
      actions.addNotification({
        type: "error",
        message: error.message,
      })
    }
  }

  const handleFacebookLogin = () => {
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          handleFacebookResponse(response)
        } else {
          actions.addNotification({
            type: "error",
            message: "Login com Facebook cancelado",
          })
        }
      },
      { scope: "email,public_profile" },
    )
  }

  const handleFacebookResponse = async (response) => {
    try {
      window.FB.api("/me", { fields: "email,name" }, async (userInfo) => {
        const result = await fetch("http://localhost:3001/api/auth/facebook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: response.authResponse.accessToken,
            userID: response.authResponse.userID,
            email: userInfo.email,
            name: userInfo.name,
          }),
        })

        const data = await result.json()
        if (!result.ok) throw new Error(data.message || "Falha no login com Facebook")

        // Simular login bem-sucedido
        actions.login({ email: data.usuario.email, senha: "facebook_auth" })
      })
    } catch (error) {
      actions.addNotification({
        type: "error",
        message: error.message,
      })
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div className="text">{formState}</div>
        <div className="underline"></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="inputs">
          {formState === "Sign Up" && (
            <>
              <div className="input">
                <input
                  type="text"
                  name="nome"
                  placeholder="Nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input">
                <input
                  type="tel"
                  name="telefone"
                  placeholder="Número de telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
          <div className="input">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input">
            <input
              type="password"
              name="senha"
              placeholder="Senha"
              value={formData.senha}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {formState === "Login" && (
          <div className="forgot-password">
            Esqueceu a senha? <span>Clique aqui!</span>
          </div>
        )}

        {state.errors.auth && <div className="error-message">{state.errors.auth}</div>}

        <div className="submit-container">
          <button
            type="button"
            className={formState === "Login" ? "submit gray" : "submit"}
            onClick={() => {
              setFormState("Sign Up")
              actions.clearError("auth")
            }}
          >
            Cadastrar
          </button>
          <button
            type="button"
            className={formState === "Sign Up" ? "submit gray" : "submit"}
            onClick={() => {
              setFormState("Login")
              actions.clearError("auth")
            }}
          >
            Login
          </button>
        </div>

        <button type="submit" className="submit-button" disabled={state.loading.auth}>
          {state.loading.auth ? (
            <>
              <LoadingSpinner size="small" color="white" />
              Processando...
            </>
          ) : formState === "Login" ? (
            "Entrar"
          ) : (
            "Cadastrar"
          )}
        </button>
      </form>

      <div className="social-login">
        <div className="social-text">Ou entre com</div>
        <div className="social-icons">
          <button
            className="social-button google"
            onClick={handleGoogleLogin}
            disabled={state.loading.auth}
            type="button"
          >
            <div className="social-icon google-icon"></div>
            Google
          </button>
          <button
            className="social-button facebook"
            onClick={handleFacebookLogin}
            disabled={state.loading.auth}
            type="button"
          >
            <div className="social-icon facebook-icon"></div>
            Facebook
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginRegister

