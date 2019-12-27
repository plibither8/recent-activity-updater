const fetch = require('node-fetch')

const {
	// Spotify
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET,

	// Last.fm
	LASTFM_KEY,
	LASTFM_USER
} = process.env

// Main function
module.exports = async function() {
	// First setup spotify access token and function
	// to get artist images
	const authorization = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
	const SPOTIFY_ACCESS_TOKEN =
		await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Basic ' + authorization
			},
			body: 'grant_type=client_credentials'
		})
		.then(res => res.json())
		.then(res => res.access_token)
	console.log('done: spotify access token')

	// function to get the artist image from search
	async function getArtistImageFromSpotify(artistName) {
		const searchUrl =
			'https://api.spotify.com/v1/search?type=artist&q=' +
			encodeURIComponent(artistName)
		const searchResults = await fetch(searchUrl, {
			headers: {
				'Authorization': 'Bearer ' + SPOTIFY_ACCESS_TOKEN
			}
		}).then(res => res.json())
		const artist = searchResults.artists.items[0]
		const artistImage = artist.images[2].url // 64x64
		return artistImage
	}

	const LASTFM_API_BASE =
		'http://ws.audioscrobbler.com/2.0/?format=json' +
		'&user=' + LASTFM_USER +
		'&api_key=' + LASTFM_KEY

	// create last.fm api url and get data
	const LASTFM_API_TOP_ARTISTS = LASTFM_API_BASE + '&method=user.gettopartists&period=7day'
	const data = await fetch(LASTFM_API_TOP_ARTISTS).then(res => res.json())
	console.log('done: last.fm top artists')

	// the top five most listened to artists this week
	const topFive = []

	// select the top five artists and their data
	for (let i = 0; i < 5; i++) {
		const {
			name,
			playcount,
			url
		} = data.topartists.artist[i]
		const image = await getArtistImageFromSpotify(name)
		topFive.push({
			name,
			playcount,
			image,
			url
		})
	}
	console.log('done: spotify artist images')

	// Get total tracks scrobbled
	const LASTFM_API_WEEKLY_TRACKS = LASTFM_API_BASE + '&method=user.getweeklytrackchart'
	let weeklyTrackList = await fetch(LASTFM_API_WEEKLY_TRACKS)
		.then(res => res.json())
	weeklyTrackList = weeklyTrackList.weeklytrackchart.track
	console.log('done: last.fm weekly track chart')

	let totalPlayCount = 0
	for (const track of weeklyTrackList) {
		totalPlayCount += Number(track.playcount)
	}

	return {
		totalPlayCount,
		topFive
	}
}
