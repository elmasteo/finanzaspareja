exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { Octokit } = await import("@octokit/rest");

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = "elmasteo";
  const REPO_NAME = "finanzaspareja";
  const FILE_PATH = "gastos.json";
  const BRANCH = "master";

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  try {
    const body = JSON.parse(event.body);

    // Obtener contenido actual del archivo
    const { data: fileData } = await octokit.request(
      `GET /repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      { ref: BRANCH }
    );

    const contenido = Buffer.from(fileData.content, "base64").toString("utf8");
    let json = JSON.parse(contenido);

    // Si se manda un array, es reemplazo completo (liquidar o eliminar)
    if (Array.isArray(body)) {
      json.gastos = body;
    } else {
      // Si es solo un gasto nuevo, agregarlo
      const nuevoGasto = { ...body, id: Date.now() };
      json.gastos.push(nuevoGasto);
    }

    const nuevoContenido = Buffer.from(JSON.stringify(json, null, 2)).toString("base64");

    await octokit.request(
      `PUT /repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: FILE_PATH,
        message: "Actualizar gastos",
        content: nuevoContenido,
        sha: fileData.sha,
        branch: BRANCH,
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
