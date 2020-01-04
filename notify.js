const {readFile} = require('fs').promises
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
	const hnDelta = require('./delta.json')

	const texts = {
		'Hacker News': `• Added: ${hnDelta.added}\n• Removed: ${hnDelta.removed}`,

		'Last.fm': data.lastfm.topFive
			.map(artist => `• ${artist.name}: ${artist.playcount}`)
			.join('\n'),

		'WakaTime': data.wakatime.languages
			.map(lang => `• ${lang.name}: ${lang.time}`)
			.join('\n')
	}

	let message = `*🔔 Recent Activity updated!*
Visit site: https://plibither8.netlify.com

*Summary:*\n\n`

	for (const [name, text] of Object.entries(texts)) {
		message += `_${name}_\n${text}\n\n`
	}

	message = message.trim()
	console.log(message)

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
