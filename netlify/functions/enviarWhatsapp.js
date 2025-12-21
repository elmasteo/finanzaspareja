// netlify/functions/enviarWhatsapp.js

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { number, text } = JSON.parse(event.body);

  const response = await fetch("https://ip-172-31-43-210.taile4b68d.ts.net/message/sendText/misFinanzas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.EVOLUTIONAPI_TOKEN,
    },
    body: JSON.stringify({ number, text })
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, data })
  };
};
