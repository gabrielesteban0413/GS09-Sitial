import { Outlet } from "react-router-dom";
import { PublicHeader } from "../components/PublicHeader";
import { PublicFooter } from "../components/PublicFooter";
import { GeoAtmosphere } from "../components/GeoAtmosphere";

export function PublicLayout() {
    return (
        <div className="public-layout">
            <GeoAtmosphere variant="public" />
            <PublicHeader />
            <div style={{ flex: 1 }}>
                <Outlet />
            </div>
            <PublicFooter />
        </div>
    );
}