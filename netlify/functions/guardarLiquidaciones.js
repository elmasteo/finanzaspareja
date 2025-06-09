exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { Octokit } = await import("@octokit/rest");
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = "elmasteo";
  const REPO_NAME = "finanzaspareja";
  const FILE_PATH = "liquidaciones.json";
  const BRANCH = "master";
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  try {
    const nuevoContenido = JSON.parse(event.body);

    const { data: fileData } = await octokit.request(
      `GET /repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      { ref: BRANCH }
    );

    const sha = fileData.sha;
    const nuevoJSON = JSON.stringify(nuevoContenido, null, 2);

    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
      message: "Actualizando liquidaciones",
      content: Buffer.from(nuevoJSON).toString("base64"),
      branch: BRANCH,
      sha
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: error.message }) };
  }
};
