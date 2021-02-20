const fetch = require('node-fetch')
const jsyaml = require('js-yaml')

const { WAKATIME_KEY } = process.env

const exceptions = {
	colors: {
		GAS: {
			group: "Assembly"
		},
		JSON: {
			group: "JavaScript"
		},
		Svelte: {
			color: "#ff3e00"
		}
	},
	names: {
		GAS: "Assembly",
		Bash: "Shell"
	}
}

// Main function
module.exports = async function() {
	// this will hold all the color data
	let colorData = await fetch('https://rawgit.com/github/linguist/master/lib/linguist/languages.yml')
		.then(res => res.text())
		.then(text => jsyaml.safeLoad(text))
	console.log('done: github linguist colors')

	colorData = {
		...colorData,
		...exceptions.colors
	}

	// get a language color data
	async function getLanguageColor(name) {
		// default color
		let color = '#cccccc'

		// important checks
		if (colorData[name]) {
			if (colorData[name].color) {
				color = colorData[name].color
			} else {
				const {group} = colorData[name]
				if (group && colorData[group].color) {
					color = colorData[group].color
				}
			}
		}

		return color
	}

	// wakatime api url
	const WAKATIME_API = 'https://wakatime.com/api/v1/users/current/stats/last_7_days'
	const authorization = Buffer.from(WAKATIME_KEY).toString('base64')

	// get json response of stats
	const stats =
		await fetch(WAKATIME_API, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + authorization
			}
		})
		.then(res => res.json())
		.then(res => res.data)
	console.log('done: wakatime stats')

	// stats that i want
	const filteredStats = {
		total: stats.human_readable_total,
		average: stats.human_readable_daily_average,
		languages: [] // top five langs
	}

	for (let i = 0; filteredStats.languages.length < 5 && i < stats.languages.length; i++) {
		const lang = stats.languages[i]
		if (lang.name === 'Other') {
			continue
		}

		const langName = exceptions.names[lang.name] || lang.name

		filteredStats.languages.push({
			name: langName,
			percent: lang.percent,
			time: lang.text,
			color: await getLanguageColor(langName)
		})
	}

	return filteredStats
}
