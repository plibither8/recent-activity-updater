require("dotenv").config();

const { Octokit } = require("@octokit/rest");
const services = require("require-all")(__dirname + "/services");
const fetch = require("node-fetch");

const notify = require("./notify");

// GitHub Gists env variables
const { GIST_ID, GITHUB_TOKEN, NETLIFY_BUILD_HOOK } = process.env;

// actual function that runs it all
async function main() {
  const octokit = new Octokit({ auth: `token ${GITHUB_TOKEN}` }); // Instantiate Octokit
  const originalGist = await octokit.gists.get({ gist_id: GIST_ID }); // get the gist
  const gistContent = JSON.parse(
    Object.values(originalGist.data.files)[0].content
  );

  for (const [name, func] of Object.entries(services)) {
    try {
      gistContent[name] = await func(gistContent);
    } catch (err) {
      console.error(`Service "${name}" failed:`, err);
    }
  }

  // Get original filename to update that same file
  const filename = Object.keys(originalGist.data.files)[0];
  // await octokit.gists.update({
  //   gist_id: GIST_ID,
  //   files: {
  //     [filename]: {
  //       filename,
  //       content: JSON.stringify(gistContent, null, "  "),
  //     },
  //   },
  // });
  console.log("done: gist updated");

  // Notify of build finish if CI env
  if (process.env.CI) {
    await fetch(NETLIFY_BUILD_HOOK, { method: "POST" });
    // Pause Notifications for some time
    // await notify()
  }
}

(async () => {
  await main();
})();
