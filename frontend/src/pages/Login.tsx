import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { GeoAtmosphere } from "@/components/GeoAtmosphere";
import "@/styles/auth.css";

export function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try { await login(email, password); navigate("/app"); }
        catch (err: any) { setError(err.message || "Error al iniciar sesión"); }
    }

    return (
        <div className="auth-split auth-login">
            <GeoAtmosphere variant="login" />
            <div className="auth-visual">
                <div className="auth-visual-content">
                    <h1>Decide con datos,<br/>no con corazonadas.</h1>
                    <p>Miles de negocios en Latinoamérica ya eligen sus ubicaciones con Sitial.</p>
                </div>
                <div className="auth-coordinate-ribbon" aria-hidden="true">
                    <span>LOCALIZACIÓN</span><span>04°39′ N</span><span>74°05′ O</span><span>BOG / CO</span>
                </div>
            </div>
            <div className="auth-form-side">
                <span className="auth-side-index" aria-hidden="true">SITIAL / ACCESO · 01</span>
                <div className="auth-card">
                    <h1>Bienvenido de vuelta</h1>
                    <p className="subtitle">Accede a tu panel de análisis</p>
                    {error && <div style={{ color: "var(--coral-500)", marginBottom: 16 }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Correo electrónico</label>
                            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Contraseña</label>
                            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg">Iniciar sesión</button>
                    </form>
                    <p className="auth-footer">¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link></p>
                </div>
            </div>
        </div>
    );
}