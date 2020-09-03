const cliendId = '';
const spotifyHost = 'https://accounts.spotify.com/';
const apiSpotifyHost = 'https://api.spotify.com/';
let accessToken = null;
let expiresIn = null;

const Spotify = {
    getAccessToken() {
        if(accessToken) {
            return accessToken;
        }

        const callbackAccessToken = window.location.href.match(/access_token=([^&]*)/);
        const callbackExpireIn = window.location.href.match(/expires_in=([^&]*)/);
        if (callbackAccessToken && callbackExpireIn) {
            accessToken = callbackAccessToken[1];
            expiresIn = callbackExpireIn[1];
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const redirect_uri = 'http://localhost:3000/';
            const reqUri = spotifyHost + `authorize?response_type=token&client_id=${cliendId}&scope=${encodeURIComponent('playlist-modify-public user-read-private user-read-email')}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
            window.location = reqUri;
        }
    }, 
    search(term) {
        const reqUri = apiSpotifyHost + `v1/search?type=track&q=${term}`;
        const token = this.getAccessToken();
        const  header = new Headers({
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json',
            'Access-Control-Request-Method' : '*',
            'Access-Control-Request-Headers' : '*',
            'Authorization':'Bearer ' + token
        });
        return fetch(reqUri, {
                headers: header,
                method:'GET'
            })
            .then(response => response.json())
            .then(jsonRes => {
                if(!jsonRes.tracks) return[];
                return jsonRes.tracks.items.map(
                    track => {
                        return {
                            id:track.id,
                            name:track.name,
                            artist: track.artists[0].name,
                            album: track.album.name,
                            uri:track.uri
                        }
                    }
                );
            });
    },
    savePlaylist(listName, tracks) {
        const token = this.getAccessToken();
        const header = new Headers({
            'Access-Control-Request-Method' : '*',
            'Access-Control-Request-Headers' : '*',
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        const userUrl = apiSpotifyHost + 'v1/me';
        let userId;
        fetch(userUrl, {headers:header})
            .then(response => response.json())
            .then(
                jsonResponse => { 
                    userId = jsonResponse.id;
                    console.log(jsonResponse);
            })
            .then(
                () => {
                    const playlistUrl = apiSpotifyHost + `v1/users/${userId}/playlists`;
                    fetch(
                        playlistUrl, {headers:header, method:'POST', 
                        body:JSON.stringify({name:listName})}
                    )
                    .then(response => response.json())
                    .then(jsonResponse => jsonResponse.id)
                    .then(
                        listId => {
                            const addPlayListUrl = apiSpotifyHost + `v1/playlists/${listId}/tracks`;
                            fetch(addPlayListUrl, {
                                method: 'PUT',
                                headers: header,
                                body: JSON.stringify({uris: tracks})
                            });
                        }
                    )
                }
            )
    }
}

export default Spotify;