const fetch = require('node-fetch')

// Telgram Bot
const {
	TG_BOT_NAME,
	TG_BOT_SECRET
} = process.env

const message =
`*🔔 Recent Activity updated!*
Visit site: https://plibither8.netlify.com`

module.exports = async data => {
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
