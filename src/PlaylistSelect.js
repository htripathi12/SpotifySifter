import React, { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import { Link } from 'react-router-dom';
import './PlaylistSelect.css';

function PlaylistSelect() {
    const [leftPlaylists, setLeftPlaylists] = useState([]);
    const [rightPlaylists, setRightPlaylists] = useState([]);
    const [clickedPlaylist, setClickedPlaylist] = useState(null);
    const [hoveredPlaylist, setHoveredPlaylist] = useState(null);
    const [searchParams] = useSearchParams();
    const current_user_id = searchParams.get("current_user_id");

    const handleCardClick = (playlistId) => {
        console.log('Clicked Playlist ID:', playlistId);
        const clickedPlaylist = leftPlaylists.find(playlist => playlist.id === playlistId);
        setRightPlaylists(prev => [...prev, clickedPlaylist]);
        setLeftPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
        fetch(`http://localhost:8889/select/${current_user_id}/${playlistId}`)
            .then(response => response.json())
            .then(data => console.log('Manage Playlists Response:', data))
            .catch(error => console.error('Error:', error));
    }

    const handleRightCardClick = (playlistId) => {
        console.log('Clicked Playlist ID (Right):', playlistId);
        const clickedPlaylist = rightPlaylists.find(playlist => playlist.id === playlistId);
        setLeftPlaylists(prev => [...prev, clickedPlaylist]);
        setRightPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
        fetch(`http://localhost:8889/unselect/${current_user_id}/${playlistId}`)
            .then(response => response.json())
            .then(data => console.log('Manage Playlists Response:', data))
            .catch(error => console.error('Error:', error));
    }

    useEffect(() => {
        fetch(`http://localhost:9/get_playlists/${current_user_id}`)
            .then(response => response.json())
            .then(playlists => {
                const leftPlaylists = playlists.filter(playlist => playlist.selected === false);
                const rightPlaylists = playlists.filter(playlist => playlist.selected === true);
                setLeftPlaylists(leftPlaylists);
                setRightPlaylists(rightPlaylists);
            })
            .catch(error => console.error('Error:', error));
    }, []);

    useEffect(() => {
        fetch(`http://localhost:9/manage_playlists/${current_user_id}`)
            .then(response => response.json())
            .then(data => console.log('Manage Playlists Response:', data))
            .catch(error => console.error('Error:', error));
    }, []);

    function playlistContainer(playlists, isLeftContainer) {
        const sortedPlaylists = [...playlists].sort((a, b) => a.name.localeCompare(b.name));

        return (
            sortedPlaylists.map((playlist) => (
                <div
                    key={playlist.id}
                    className={`embed ${clickedPlaylist === playlist.id ? 'clicked' : ''}`}
                    onMouseEnter={() => setHoveredPlaylist(playlist.id)}
                    onMouseLeave={() => setHoveredPlaylist(null)}
                >
                    <div className="iframe-clicker" onClick={isLeftContainer ? () => handleCardClick(playlist.id) : () => handleRightCardClick(playlist.id)}></div>
                    <iframe
                        id={`embed-${playlist.id}`} 
                        style={{ borderRadius: '12px' }}
                        src={`https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator`}
                        width="100%"
                        height="352"
                        frameBorder="0"
                        allowFullScreen=""
                        className="playlist-iframe"
                        loading="lazy"
                        key={`embed-${playlist.id}`}
                    ></iframe>
                </div>
            ))
        );
    }
    
    

    return (
        <div>
            <div className="playlist-container-left">
                {playlistContainer(leftPlaylists, true)}
            </div>
            <div className="large-card-background">
                <div className="large-card-background-text">
                    <h3>Click to select playlist</h3>
                </div>
            </div>
            <div className="large-card">
                {[...rightPlaylists, ...leftPlaylists].map((playlist) => (
                    <div
                        key={playlist.id}
                        className={`large-card-embed${hoveredPlaylist === playlist.id ? '' : ' hide-embed'}`}
                    >
                        <div className="overlay" style={{ display: hoveredPlaylist === playlist.id ? 'none' : 'block' }}></div>
                        <iframe
                            id={`embed-${playlist.id}`} 
                            style={{ borderRadius: '12px' }}
                            src={`https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator`}
                            width="100%"
                            height="352"
                            frameBorder="0"
                            allowFullScreen=""
                            loading="lazy"
                            // allow="allow=autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        ></iframe>
                    </div>
                ))}
            </div>
            <div className="playlist-container-right">
                {playlistContainer(rightPlaylists, false)}
            </div>
            <Link to={`/DeletedSongsPlaylists?current_user_id=${current_user_id}`}>
                <button className="deleted-songs-playlist-button">See Deleted Songs</button>
            </Link>
            <Link to={'/Leaderboard'}>
                <button className="leaderboard-button">See Leaderboard</button>
            </Link>
        </div>
    );
}

export default PlaylistSelect;
