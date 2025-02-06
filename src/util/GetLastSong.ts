const username = "pj_au"
const api_key = import.meta.env.VITE_LAST_FM_KEY
const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${api_key}&format=json&limit=1`


async function getLastSong() {
    const response = await fetch(url)
    const data = await response.json()

    if (data.recenttracks) {
        const lastTrack = data.recenttracks.track[0]
        const trackName: string = lastTrack.name
        const artist: string = lastTrack.artist["#text"]

        return {
            artist: artist,
            trackName: trackName
        }
    }
}


export default getLastSong;