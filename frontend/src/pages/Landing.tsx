import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center",
      background:"linear-gradient(135deg,#f4f7f8,#e4eef0)",padding:"24px"}}>
      <div style={{maxWidth:"640px",textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:"8px",
          padding:"6px 14px",borderRadius:"100px",
          background:"rgba(82,188,198,0.16)",color:"#2d7880",
          fontSize:"12px",fontWeight:600,marginBottom:"24px"}}>
          Sitial
        </div>
        <h1 style={{fontSize:"44px",lineHeight:"1.1",letterSpacing:"-0.03em",
          marginBottom:"20px",fontWeight:800,color:"#0a1f24"}}>
          Elige la mejor ubicación para tu próximo local
        </h1>
        <p style={{fontSize:"17px",color:"#5a6d73",lineHeight:"1.6",marginBottom:"36px"}}>
          Combina afluencia peatonal, competencia y demografía en un solo score.
          Decide con datos, no con corazonadas.
        </p>
        <div style={{display:"flex",gap:"12px",justifyContent:"center"}}>
          <Link to="/register" style={{background:"#3a9aa3",color:"#fff",
            padding:"14px 28px",borderRadius:"10px",fontWeight:600,fontSize:"14px",
            boxShadow:"0 4px 14px rgba(58,154,163,0.3)"}}>Empezar gratis</Link>
          <Link to="/login" style={{background:"#fff",color:"#0a1f24",
            padding:"14px 28px",borderRadius:"10px",fontWeight:600,fontSize:"14px",
            border:"1px solid #d5dfe2"}}>Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}
