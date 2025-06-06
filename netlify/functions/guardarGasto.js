const { Octokit } = await import("@octokit/rest");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = "elmasteo";
  const REPO_NAME = "finanzaspareja";
  const FILE_PATH = "gastos.json";
  const BRANCH = "master";

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  try {
    const nuevoGasto = JSON.parse(event.body);
    nuevoGasto.id = Date.now();

    // Obtener contenido actual del archivo
    const { data: fileData } = await octokit.request(
      `GET /repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      { ref: BRANCH }
    );

    const contenido = Buffer.from(fileData.content, "base64").toString("utf8");
    const json = JSON.parse(contenido);
    json.gastos.push(nuevoGasto);

    const nuevoContenido = Buffer.from(JSON.stringify(json, null, 2)).toString("base64");

    await octokit.request(
      `PUT /repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: FILE_PATH,
        message: `Agregar gasto ${nuevoGasto.id}`,
        content: nuevoContenido,
        sha: fileData.sha,
        branch: BRANCH
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, gasto: nuevoGasto })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
