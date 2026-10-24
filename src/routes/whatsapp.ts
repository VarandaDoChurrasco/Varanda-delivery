import { Router } from "express";
import { timingSafeEqual } from "node:crypto";

type WhatsAppControls = {
  getStatus(): { status: string; qr: string | null };
  iniciar(): Promise<unknown>;
  resetar(): Promise<unknown>;
};

export function createWhatsAppRouter(whatsapp: WhatsAppControls) {
  const router = Router();
  router.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  router.get("/status", (_req, res) => res.json(whatsapp.getStatus()));
  router.get("/qr", (_req, res) => res.type("html").send(page));

  // Falha fechada: nunca disponibiliza controles sem configurar autenticação.
  router.post(["/iniciar", "/resetar"], (req, res, next) => {
    const token = process.env.WHATSAPP_ADMIN_TOKEN;
    if (!token?.trim()) {
      res.status(503).json({ error: "Controles administrativos não configurados." });
      return;
    }
    const actual = Buffer.from(req.get("Authorization") ?? "");
    const expected = Buffer.from(`Bearer ${token}`);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      res.status(401).json({ error: "Token administrativo inválido." });
      return;
    }
    next();
  });
  for (const action of ["iniciar", "resetar"] as const) {
    router.post(`/${action}`, async (_req, res) => {
      try {
        await whatsapp[action]();
        res.json(whatsapp.getStatus());
      } catch (error) {
        console.error(`Erro ao ${action} WhatsApp:`, error);
        res.status(500).json({ error: "Falha ao alterar conexão do WhatsApp." });
      }
    });
  }
  return router;
}

const page = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Varanda - WhatsApp</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
    img { max-width: 90vw; width: 400px; }
    button, input { padding: 10px; margin: 6px; }
  </style>
</head>
<body>
  <h1>WhatsApp</h1>
  <p id="status" role="status">Carregando...</p>
  <p>Abra o WhatsApp → Dispositivos conectados → Conectar dispositivo</p>
  <img id="qr" hidden alt="QR Code do WhatsApp" />
  <div><button id="refresh">Atualizar QR</button></div>
  <div>
    <label>Token administrativo <input id="token" type="password" autocomplete="off" /></label>
    <button id="start">Iniciar conexão</button>
    <button id="reset">Resetar sessão</button>
  </div>
  <p id="error" role="alert"></p>
  <script>
    const status = document.getElementById('status');
    const qr = document.getElementById('qr');
    const error = document.getElementById('error');
    const start = document.getElementById('start');
    const reset = document.getElementById('reset');
    let busy = false;
    function render(data) {
      status.textContent = data.qr ? 'QR disponível — aguardando leitura' : data.status;
      qr.hidden = !data.qr;
      if (data.qr) qr.src = data.qr;
      else qr.removeAttribute('src');
    }
    async function refresh() {
      try {
        const response = await fetch('/whatsapp/status', { cache: 'no-store' });
        if (!response.ok) throw Error('Falha ao atualizar QR.');
        const data = await response.json();
        if (!busy) render(data);
      } catch (err) { error.textContent = err.message; }
    }
    async function control(action) {
      if (busy) return;
      busy = true;
      start.disabled = reset.disabled = true;
      error.textContent = '';
      try {
        const response = await fetch('/whatsapp/' + action, {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + document.getElementById('token').value }
        });
        const data = await response.json();
        if (!response.ok) throw Error(data.error);
        render(data);
      } catch (err) { error.textContent = err.message; }
      finally { busy = false; start.disabled = reset.disabled = false; }
    }
    document.getElementById('refresh').onclick = refresh;
    start.onclick = () => control('iniciar');
    reset.onclick = () => control('resetar');
    refresh();
    setInterval(refresh, 3000);
  </script>
</body>
</html>`;
