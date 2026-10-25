import { Outlet } from "react-router-dom";
import { PublicHeader } from "../components/PublicHeader";
import { PublicFooter } from "../components/PublicFooter";

export function PublicLayout() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <PublicHeader />
            <div style={{ flex: 1 }}>
                <Outlet />
            </div>
            <PublicFooter />
        </div>
    );
}