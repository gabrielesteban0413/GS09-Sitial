import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import "@/styles/public.css";

export function Pago() {
    const [searchParams] = useSearchParams();
    const plan = searchParams.get("plan") || "starter";
    const nombre = plan === "starter" ? "Starter" : "Pro";
    const precio = plan === "starter" ? 49 : 199;

    return (
        <div style={{ background: "var(--bg)", padding: "60px 0 100px", minHeight: "100vh" }}>
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 12 }}>Suscripción al plan {nombre}</h1>
                    <p style={{ color: "var(--text-3)" }}>Completa tus datos para activar tu cuenta.</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>
                    <div className="card" style={{ padding: 40 }}>
                        <h3 style={{ marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>1. Datos personales</h3>
                        <div className="form-group"><label className="form-label">Nombre completo</label><input className="form-input" placeholder="Ej: Juan Pérez" /></div>
                        <div className="form-group"><label className="form-label">Correo electrónico</label><input className="form-input" placeholder="tu@email.com" /></div>
                        <h3 style={{ marginTop: 32, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>2. Método de pago</h3>
                        <div className="form-group"><label className="form-label">Número de tarjeta</label><input className="form-input" placeholder="4242 4242 4242 4242" /></div>
                        <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 20 }}>Pagar ${precio} USD/mes</button>
                    </div>
                    <div>
                        <div className="card" style={{ padding: 28 }}>
                            <h3 style={{ marginBottom: 20 }}>Resumen del pedido</h3>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}><span>Plan</span><b>{nombre}</b></div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}><span>Precio</span><b>${precio} USD</b></div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "18px 0 4px", fontSize: 18 }}><span>Total</span><b>${(precio * 1.19).toFixed(2)} USD</b></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}