import React from 'react';
import Playlist from '../Playlist/Playlist';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Spotify from '../../util/Spotify'
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchResults: [
            ],
            playlistName: "",
            playlistTracks: [
            ]
        };
        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.updatePlaylistName = this.updatePlaylistName.bind(this);
        this.savePlaylist = this.savePlaylist.bind(this);
        this.search = this.search.bind(this);
    }
    removeTrack = (track) => {
        const playList = this.state.playlistTracks.filter(playlistTrack => playlistTrack.id !== track.id);
        this.setState({
            playlistTracks:playList
        });
    }
    updatePlaylistName = (name) => {
        this.setState({playlistName:name});
    }
    addTrack = (track) => {
        if(!this.state.playlistTracks.find(playlistTrack => playlistTrack.id === track.id)){
            this.setState(prevState => ({
                playlistTracks: [...prevState.playlistTracks, track]
            }));
        }
    }
    savePlaylist = () => {
        const trackUris = this.state.playlistTracks.map(playlistTrack => playlistTrack.uri);
        Spotify.savePlaylist(this.state.playlistName, trackUris);
        this.setState({
            searchResults: []
        });
        this.updatePlaylistName('My playlist');
    }
    search = (search) => {
        Spotify.search(search).then(searchResults => {
            this.setState({searchResults: searchResults});
        });
    }
    render() {
        return (
            <div>
            <h1>Ja<span className="highlight">mmm</span>ing</h1>
            <SearchBar onSearch={this.search}/>
            <div className="App">
                <div className="App-playlist">
                    <SearchResults onAdd={this.addTrack} searchResults={this.state.searchResults}/>
                    <Playlist onSave={this.savePlaylist} onNameChange={this.updatePlaylistName} isRemoval={true} onRemove={this.removeTrack} playlistTracks={this.state.playlistTracks} playlistName={this.state.playlistName}/>
                </div>
            </div>
            </div>
        );
    }
}
export default App;