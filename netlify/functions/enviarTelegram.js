// netlify/functions/enviarTelegram.js
//
// Variables de entorno requeridas (Netlify > Site configuration > Environment variables):
//   TELEGRAM_BOT_TOKEN = token que entrega @BotFather
//   TELEGRAM_CHAT_IDS  = 1120036844, 8301357458   (separados por coma)

const json = (statusCode, payload) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { success: false, error: "Método no permitido" });
  }

  let text;
  try {
    ({ text } = JSON.parse(event.body || "{}"));
  } catch {
    return json(400, { success: false, error: "JSON inválido" });
  }

  if (typeof text !== "string" || !text.trim()) {
    return json(400, { success: false, error: "Falta el campo 'text'" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!token || chatIds.length === 0) {
    return json(500, {
      success: false,
      error: "Falta configurar TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_IDS",
    });
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  // Telegram acepta máximo 4096 caracteres por mensaje
  const mensaje = text.slice(0, 4096);

  // Se envía a todos los chats en paralelo; si uno falla, los demás igual reciben el mensaje
  const resultados = await Promise.allSettled(
    chatIds.map(async (chatId) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: mensaje }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.description || `HTTP ${res.status}`);
      }
      return chatId;
    })
  );

  const fallidos = resultados
    .map((r, i) =>
      r.status === "rejected"
        ? { chatId: chatIds[i], error: r.reason?.message || "Error desconocido" }
        : null
    )
    .filter(Boolean);

  const enviados = chatIds.length - fallidos.length;

  return json(enviados > 0 ? 200 : 502, {
    success: enviados > 0,
    enviados,
    fallidos,
  });
};