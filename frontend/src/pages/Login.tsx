import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await login(email, password); navigate("/app"); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Error al iniciar sesión"); }
    finally { setLoading(false); }
  }

  return (
    <div className="page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Iniciar sesión</h1>
        <p>Accede a tu cuenta de Sitial</p>
        {error && <div className="error-box">{error}</div>}
        <div className="field">
          <label>Correo electrónico</label>
          <input type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.com" />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input type="password" required value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        <div className="swap">¿No tienes cuenta? <Link to="/register">Regístrate</Link></div>
      </form>
    </div>
  );
}
