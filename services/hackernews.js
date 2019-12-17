const fetch = require('node-fetch')

// Main function
module.exports = async function(gist) {
	const gistContent = JSON.parse(Object.values(gist.data.files)[0].content)
	const oldFaves = gistContent.hackernews

	const HN_FAVES_URL = 'https://hn-faves.mihir.ch/plibither8?all=true'
	const currentFaveIds = await fetch(HN_FAVES_URL)
		.then(res => res.json())
		.then(res => Object.values(res).flat())
		.then(res => res.map(item => Number(item.id)))
	console.log('done: hacker news faves')

	// Remove _removed_ favorited items
	const currentList = oldFaves.filter(item1 => currentFaveIds.find(item2 => item1.id === item2))
	const addedItems = currentFaveIds.filter(item1 => !oldFaves.find(item2 => item1 === item2.id))

	// number of items removed + added
	console.log('hn faves delta:', oldFaves.length - currentList.length + addedItems.length)

	const HN_API_URL = 'http://hn.algolia.com/api/v1/items'

	let count = 1
	for (const [index, item] of addedItems.entries()) {
		const details = await fetch(`${HN_API_URL}/${item}`).then(res => res.json())
		addedItems[index] = {
			id: details.id,
			link: details.url,
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
