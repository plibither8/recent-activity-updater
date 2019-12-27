const Octokit = require('@octokit/rest')
const services = require('require-all')(__dirname + '/services')

const notify = require('./notify')

// GitHub Gists env variables
const {
	GIST_ID,
	GITHUB_TOKEN
} = process.env

// actual function that runs it all
async function main() {
	const octokit = new Octokit({ auth: `token ${GITHUB_TOKEN}` }) // Instantiate Octokit
	const gist = await octokit.gists.get({ gist_id: GIST_ID }) // get the gist

	// get final gist content
	const gistContent = {}

	for (const [name, func] of Object.entries(services)) {
		gistContent[name] = await func(gist)
	}

	// Get original filename to update that same file
	const filename = Object.keys(gist.data.files)[0]
	await octokit.gists.update({
		gist_id: GIST_ID,
		files: {
			[filename]: {
				filename,
				content: JSON.stringify(gistContent, null, '  ')
			}
		}
	})
	console.log('done: gist updated')

	// Notify of build finish if CI env
	if (process.env.CI) {
		await notify()
	}
}

(async () => {
	await main()
})()
