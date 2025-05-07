import { useState, useEffect } from "react";
import "./LoginRegister.css";

const LoginRegister = () => {
    const [state, setState] = useState("Login");
    const [formData, setFormData] = useState({
        nome: "",
        sobrenome: "",
        email: "",
        senha: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadGoogleScript = () => {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);

            script.onload = () => {
                window.google?.accounts.id.initialize({
                    client_id: "474311907571-g0d6vjrjgatf3d0b7do9fq6cm9u5par1.apps.googleusercontent.com",
                    callback: handleGoogleResponse,
                });
            };
        };

        loadGoogleScript();
        loadFacebookSDK();
    }, []);

    const loadFacebookSDK = () => {
        window.fbAsyncInit = () => {
            window.FB.init({
                appId: "2406762519701766",
                cookie: true,
                xfbml: true,
                version: "v17.0",
            });
        };

        ((d, s, id) => {
            let js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        })(document, "script", "facebook-jssdk");
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const endpoint = state === "Sign Up" 
                ? "http://localhost:3001/api/register" 
                : "http://localhost:3001/api/login";
            
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: formData.nome,
                    sobrenome: formData.sobrenome,
                    email: formData.email,
                    senha: formData.senha
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Operação falhou");
            }

            setUser(data.usuario || data);
            console.log("Sucesso:", data);
            
            if (state === "Sign Up") {
                alert("Cadastro realizado com sucesso!");
                setState("Login");
            } else {
                // Redirecionar para a página após login
                // window.location.href = "/dashboard";
            }
        } catch (error) {
            setError(error.message || "Ocorreu um erro. Tente novamente.");
            console.error("Erro:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.google?.accounts.id.prompt();
    };

    const handleGoogleResponse = async (response) => {
        setLoading(true);
        try {
            const result = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: response.credential }),
            });

            const data = await result.json();
            if (!result.ok) throw new Error(data.message || "Falha no login com Google");
            
            setUser(data.user);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookLogin = () => {
        window.FB.login(
            (response) => {
                if (response.authResponse) {
                    handleFacebookResponse(response);
                } else {
                    setError("Login com Facebook cancelado");
                }
            },
            { scope: "email,public_profile" }
        );
    };

    const handleFacebookResponse = async (response) => {
        setLoading(true);
        try {
            window.FB.api("/me", { fields: "email,name" }, async (userInfo) => {
                const result = await fetch("/api/auth/facebook", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        accessToken: response.authResponse.accessToken,
                        userID: response.authResponse.userID,
                        email: userInfo.email,
                        name: userInfo.name,
                    }),
                });

                const data = await result.json();
                if (!result.ok) throw new Error(data.message || "Falha no login com Facebook");
                
                setUser(data.user);
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="header">
                <div className="text">{state}</div>
                <div className="underline"></div>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="inputs">
                    {state === "Sign Up" && (
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
                                    type="text"
                                    name="sobrenome"
                                    placeholder="Sobrenome"
                                    value={formData.sobrenome}
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
                
                {state === "Login" && (
                    <div className="forgot-password">
                        Esqueceu a senha? <span>Clique aqui!</span>
                    </div>
                )}
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="submit-container">
                    <button
                        type="button"
                        className={state === "Login" ? "submit gray" : "submit"}
                        onClick={() => {
                            setState("Sign Up");
                            setError("");
                        }}
                    >
                        Cadastrar
                    </button>
                    <button
                        type="button"
                        className={state === "Sign Up" ? "submit gray" : "submit"}
                        onClick={() => {
                            setState("Login");
                            setError("");
                        }}
                    >
                        Login
                    </button>
                </div>
                
                <button 
                    type="submit" 
                    className="submit-button" 
                    disabled={loading}
                >
                    {loading ? "Processando..." : state === "Login" ? "Entrar" : "Cadastrar"}
                </button>
            </form>
            
            <div className="social-login">
                <div className="social-text">Ou entre com</div>
                <div className="social-icons">
                    <button 
                        className="social-button google" 
                        onClick={handleGoogleLogin} 
                        disabled={loading}
                    >
                        <div className="social-icon google-icon"></div>
                        Google
                    </button>
                    <button 
                        className="social-button facebook" 
                        onClick={handleFacebookLogin} 
                        disabled={loading}
                    >
                        <div className="social-icon facebook-icon"></div>
                        Facebook
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginRegister;