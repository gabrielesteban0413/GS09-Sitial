import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { PublicLayout } from "./layouts/PublicLayout";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Pago } from "./pages/Pago";
import { Nosotros } from "./pages/Nosotros";
import { Contacto } from "./pages/Contacto";
import { Privacidad } from "./pages/Privacidad";
import { Terminos } from "./pages/Terminos";
import { Cookies } from "./pages/Cookies";
import { Dashboard } from "./pages/Dashboard";
import { Analysis } from "./pages/Analysis";
import { Layers } from "./pages/Layers";
import { Documentation } from "./pages/Documentation";
import "./styles/public.css";

function PrivateLayout() {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading-page">Cargando...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return <Outlet />;
}

export function App() {
    return (
        <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<Landing />} />
                        <Route path="/pago" element={<Pago />} />
                        <Route path="/nosotros" element={<Nosotros />} />
                        <Route path="/contacto" element={<Contacto />} />
                        <Route path="/privacidad" element={<Privacidad />} />
                        <Route path="/terminos" element={<Terminos />} />
                        <Route path="/cookies" element={<Cookies />} />
                    </Route>
                    
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    <Route path="/app" element={<PrivateLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="analisis" element={<Analysis />} />
                        <Route path="analysis" element={<Navigate to="/app/analisis" replace />} />
                        <Route path="capas" element={<Layers />} />
                        <Route path="documentacion" element={<Documentation />} />
                    </Route>
                    <Route path="/analisis" element={<Navigate to="/app/analisis" replace />} />
                    <Route path="/analysis" element={<Navigate to="/app/analisis" replace />} />
                    <Route path="/dashboard" element={<Navigate to="/app" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}