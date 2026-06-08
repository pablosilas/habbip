// ── Como integrar no seu main.jsx ou App.jsx ─────────────────────────────────
//
// 1. Defina no seu .env (frontend):
//      VITE_MAINTENANCE=true
//      VITE_PREVIEW_KEY=suachavesecreta
//
// 2. No Vercel/Netlify/Railway: adicione as env vars no painel do serviço.
//
// 3. Para ativar a manutenção: VITE_MAINTENANCE=true → rebuild/redeploy.
//    Para desativar:           VITE_MAINTENANCE=false → rebuild/redeploy.
//    (ou remover a variável)
//
// 4. Para acessar o preview enquanto em manutenção:
//      https://seusite.com/?preview=suachavesecreta
//    O acesso fica salvo na sessão do navegador — não precisa colocar toda vez.
//
// ─────────────────────────────────────────────────────────────────────────────

import React from "react"
import ReactDOM from "react-dom/client"
import MaintenancePage, { useMaintenanceGate } from "./components/MaintenancePage.jsx"
import HabbipApp from "./views/HabbipApp"
import AdminPage from "./views/AdminPage"
import { Analytics } from '@vercel/analytics/react';

import "./index.css"

const IS_MAINTENANCE = import.meta.env.VITE_MAINTENANCE === "true"
const IS_ADMIN = window.location.pathname === "/admin"

function Root() {
  const previewAllowed = useMaintenanceGate()

  if (IS_ADMIN) return <AdminPage />

  if (IS_MAINTENANCE && !previewAllowed) {
    return <MaintenancePage />
  }

  return <HabbipApp />
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
    <Analytics />
  </React.StrictMode>
)