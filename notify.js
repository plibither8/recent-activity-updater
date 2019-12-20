const fetch = require('node-fetch')

const {
	// Travis defaults
	TRAVIS_BUILD_NUMBER,
	TRAVIS_BUILD_WEB_URL,
	TRAVIS_EVENT_TYPE,

	// Telgram Bot
	TG_BOT_NAME,
	TG_BOT_SECRET
} = process.env

const message =
`*🔔 Recent Activity updated!*
Visit site: https://plibither8.netlify.com`

module.exports = async function() {
	await fetch(`https://tg.mihir.ch/${TG_BOT_NAME}`, {
		method: 'POST',
		body: JSON.stringify({
			text: message,
			secret: TG_BOT_SECRET
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	})
}
