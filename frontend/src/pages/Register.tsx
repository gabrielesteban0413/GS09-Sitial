import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, name);
      navigate("/app");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al registrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Crear cuenta</h1>
        <p>Empieza a analizar ubicaciones gratis</p>

        {error && <div className="error-box">{error}</div>}

        <div className="field">
          <label>Nombre completo</label>
          <input required value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="María Restrepo" />
        </div>
        <div className="field">
          <label>Correo electrónico</label>
          <input type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@empresa.com" />
        </div>
        <div className="field">
          <label>Contraseña</label>
          <input type="password" required minLength={8} value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres" />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear cuenta"}
        </button>

        <div className="swap">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
}
