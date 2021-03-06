const {writeFile} = require('fs').promises
const path = require('path')
const fetch = require('node-fetch')
const x = require('x-ray')()

const saveDelta = async delta => {
	const filePath = path.join(__dirname, '../delta.json')
	await writeFile(filePath, JSON.stringify(delta))
}

const getFaves = async comments => {
	const url = `https://news.ycombinator.com/favorites?id=plibither8&comments=${comments.toString()}`
	const list = await x(url, 'tr.athing', [{id: '@id'}]).paginate('a.morelink@href');
	return list.map(({id}) => Number(id));
}

// Main function
module.exports = async function (gist) {
	const gistContent = JSON.parse(Object.values(gist.data.files)[0].content)
	const oldFaves = gistContent.hackernews
	const currentFaveIds = [
		...(await getFaves(false)),
		...(await getFaves(true)),
	];
	console.log('done: hacker news faves')

	// Remove _removed_ favorited items
	const currentList = oldFaves.filter(item1 => currentFaveIds.find(item2 => item1.id === item2))
	const addedItems = currentFaveIds.filter(item1 => !oldFaves.find(item2 => item1 === item2.id))

	const delta = {
		added: addedItems.length,
		removed: oldFaves.length - currentList.length
	}

	// number of items removed + added
	console.log('hn faves delta:', delta.added + delta.removed)

	// write deltas to file for notify.js
	await saveDelta(delta)

	const HN_API_URL = 'http://hn.algolia.com/api/v1/items'

	let count = 1
	for (const [index, item] of addedItems.entries()) {
		await new Promise(r => setTimeout(r, 1000))
		const details = await fetch(`${HN_API_URL}/${item}`).then(res => res.json())
		addedItems[index] = {
			id: details.id,
			link: details.url || 'https://news.ycombinator.com/item?id=' + details.id,
			time: details.created_at_i * 1000,
			text: details.text,
			type: details.type,
			title: details.title
		}
		console.log(`done item: ${count++} / ${addedItems.length}`)
	}
	console.log('done: hacker news fave dates')

	const updatedFaves = [
		...currentList,
		...addedItems
	]

	// sort comments and stories by time
	updatedFaves.sort((a, b) => a.time < b.time ? 1 : -1)

	return updatedFaves
}
