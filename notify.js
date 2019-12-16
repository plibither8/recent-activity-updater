const fetch = require('node-fetch')

const {
	// Travis defaults
	TRAVIS_BUILD_ID,
	TRAVIS_BUILD_NUMBER,
	TRAVIS_BUILD_WEB_URL,
	TRAVIS_EVENT_TYPE,

	// Telgram Bot
	TG_BOT_NAME,
	TG_BOT_SECRET
} = process.env

const message =
`*🔔 Recent Activity updated!*

*Build ID:* ${TRAVIS_BUILD_ID}
*Build Number:* ${TRAVIS_BUILD_NUMBER}
*Build URL:* ${TRAVIS_BUILD_WEB_URL}
*Trigger Event Type:* ${TRAVIS_EVENT_TYPE}

[Visit site](https://plibither8.netlify.com)`

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
