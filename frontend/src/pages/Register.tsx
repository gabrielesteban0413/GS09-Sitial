import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "@/styles/auth.css";

export function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try { await register(email, password, name); navigate("/app"); }
        catch (err: any) { setError(err.message || "Error al registrar"); }
    }

    return (
        <div className="auth-split">
            <div className="auth-visual">
                <div className="auth-visual-content">
                    <h1>Empieza gratis<br/>en menos de 1 minuto.</h1>
                    <p>Crea tu cuenta y accede a 3 análisis gratuitos al mes.</p>
                </div>
            </div>
            <div className="auth-form-side">
                <div className="auth-card">
                    <h1>Crea tu cuenta</h1>
                    <p className="subtitle">Es gratis y toma menos de 1 minuto</p>
                    {error && <div style={{ color: "var(--coral-500)", marginBottom: 16 }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Nombre completo</label>
                            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Correo electrónico</label>
                            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Contraseña</label>
                            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg">Crear cuenta gratis</button>
                    </form>
                    <p className="auth-footer">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
                </div>
            </div>
        </div>
    );
}