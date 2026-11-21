import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  BadgeCheck,
  Camera,
  CreditCard,
  KeyRound,
  Mail,
  MapPinned,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import "@/styles/profile.css";

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    setError("");
    setNotice("");
    setSavingPhoto(true);
    try {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        throw new Error("Selecciona una imagen JPEG, PNG o WebP.");
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("La imagen original no puede superar 10 MB.");
      }

      const objectUrl = URL.createObjectURL(file);
      let avatarUrl: string;
      try {
        const image = new Image();
        image.src = objectUrl;
        await image.decode();
        const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("No se pudo preparar la imagen seleccionada.");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        avatarUrl = canvas.toDataURL("image/jpeg", 0.82);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }

      await updateProfile({ avatarUrl });
      setNotice("Tu foto de perfil se actualizó correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar la foto de perfil.");
    } finally {
      setSavingPhoto(false);
    }
  }

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingName(true);
    try {
      await updateProfile({ fullName: fullName.trim() });
      setNotice("Tu nombre se actualizó correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar el perfil.");
    } finally {
      setSavingName(false);
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingPassword(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setNotice("Tu contraseña se cambió correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cambiar la contraseña.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <AppShell
      active="profile"
      title="Mi perfil"
      subtitle="Tu cuenta, seguridad y opciones de servicio"
    >
      <div className="profile-page">
        <div className="profile-page-inner">
          <div className="profile-page-heading">
            <div>
              <span className="profile-kicker"><MapPinned size={14} /> SITIAL / ESPACIO DE CUENTA</span>
              <h1>Perfil y configuración</h1>
              <p>Administra tus datos de acceso y consulta las opciones disponibles para tu cuenta.</p>
            </div>
            <span className="profile-coordinate">04°39′ N · 74°05′ O<br />BOGOTÁ / CO</span>
          </div>

          {(error || notice) && (
            <div className={`profile-feedback${error ? " is-error" : ""}`} role={error ? "alert" : "status"}>
              {error || notice}
            </div>
          )}

          <section className="profile-overview">
            <div className="profile-avatar-column">
              <div className="profile-avatar">
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt={`Foto de ${user.fullName}`} />
                  : <UserRound size={29} />}
              </div>
              <input
                ref={photoInputRef}
                className="profile-photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => void handlePhotoChange(event)}
                aria-label="Seleccionar foto de perfil"
              />
              <button
                type="button"
                className="profile-photo-button"
                onClick={() => photoInputRef.current?.click()}
                disabled={savingPhoto}
              >
                <Camera size={13} /> {savingPhoto ? "Guardando…" : "Cambiar foto"}
              </button>
            </div>
            <div className="profile-overview-copy">
              <span>PERFIL ACTIVO</span>
              <h2>{user?.fullName ?? "Usuario Sitial"}</h2>
              <p><Mail size={14} /> {user?.email ?? "Correo no disponible"}</p>
            </div>
            <div className="profile-active-badge"><BadgeCheck size={15} /> Cuenta activa</div>
          </section>

          <div className="profile-panels">
            <section className="profile-panel">
              <div className="profile-panel-heading">
                <span className="profile-panel-icon"><UserRound size={18} /></span>
                <div>
                  <span className="profile-panel-index">CUENTA / 01</span>
                  <h2>Datos personales</h2>
                </div>
              </div>
              <form className="profile-form" onSubmit={saveName}>
                <label htmlFor="profile-name">Nombre completo</label>
                <input
                  id="profile-name"
                  className="form-input"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  minLength={2}
                  maxLength={120}
                  required
                />
                <label htmlFor="profile-email">Correo de acceso</label>
                <input id="profile-email" className="form-input" value={user?.email ?? ""} readOnly />
                <p className="profile-field-note">El correo se mantiene como identificador de inicio de sesión. Para solicitar un cambio, contacta al equipo.</p>
                <button type="submit" className="profile-primary-button" disabled={savingName || fullName.trim() === user?.fullName}>
                  <Save size={15} /> {savingName ? "Guardando…" : "Guardar cambios"}
                </button>
              </form>
            </section>

            <section className="profile-panel">
              <div className="profile-panel-heading">
                <span className="profile-panel-icon profile-panel-icon-plum"><ShieldCheck size={18} /></span>
                <div>
                  <span className="profile-panel-index">SEGURIDAD / 02</span>
                  <h2>Cambiar contraseña</h2>
                </div>
              </div>
              <form className="profile-form" onSubmit={savePassword}>
                <label htmlFor="profile-current-password">Contraseña actual</label>
                <input
                  id="profile-current-password"
                  className="form-input"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  minLength={8}
                  required
                />
                <label htmlFor="profile-new-password">Nueva contraseña</label>
                <input
                  id="profile-new-password"
                  className="form-input"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={8}
                  maxLength={128}
                  required
                />
                <p className="profile-field-note">Usa al menos 8 caracteres. La contraseña actual se verifica antes de guardar.</p>
                <button type="submit" className="profile-plum-button" disabled={savingPassword}>
                  <KeyRound size={15} /> {savingPassword ? "Actualizando…" : "Actualizar contraseña"}
                </button>
              </form>
            </section>

            <section className="profile-panel profile-billing-panel">
              <div className="profile-panel-heading">
                <span className="profile-panel-icon"><CreditCard size={18} /></span>
                <div>
                  <span className="profile-panel-index">SERVICIO / 03</span>
                  <h2>Pagos y planes</h2>
                </div>
              </div>
              <div className="profile-billing-status">
                <span className="profile-status-dot" />
                <div>
                  <strong>Sin suscripción vinculada</strong>
                  <p>La gestión de pagos aún no está conectada a esta cuenta.</p>
                </div>
              </div>
              <Link to="/contacto" className="profile-contact-link">
                Consultar opciones con el equipo <CreditCard size={15} />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
