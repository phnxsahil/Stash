// Isolated UI fixture: sample data and local actions only; no live API requests.
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MotionConfig} from 'framer-motion';
import {AppView} from '../src/components/AppView';
import '../src/index.css';
import type {Song} from '../src/types';
function artwork(title:string,color:string,kind:number) {
 const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="${color}"/><circle cx="${kind?220:150}" cy="${kind?90:150}" r="115" fill="none" stroke="#ffffff38" stroke-width="1"/><circle cx="150" cy="150" r="75" fill="none" stroke="#ffffff38" stroke-width="1"/><path d="M0 230 L300 60 M0 260 L300 90 M0 290 L300 120" stroke="#ffffff18" stroke-width="12"/><text x="24" y="45" fill="white" font-family="sans-serif" font-size="14" letter-spacing="2">SAMPLE SLEEVE</text><text x="24" y="266" fill="white" font-family="sans-serif" font-size="24" font-weight="bold">${title}</text></svg>`;
 return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
const now=Date.now();
const seed:Song[] = [
 {id:'1',song:'Night Drive',artist:'The Midnight Hours',source:'Instagram',created_at:new Date(now).toISOString(),album_art_url:artwork('NIGHT DRIVE','#633c42',0),spotify_url:'https://open.spotify.com/track/demo1'},
 {id:'2',song:'A song with a wonderfully long title that should stay readable',artist:'An artist with an equally long name',source:'YouTube',created_at:new Date(now-86400000).toISOString(),album_art_url:artwork('AFTER HOURS','#284b4c',1),spotify_url:'https://open.spotify.com/track/demo2'},
 {id:'3',song:'Slow Sunday',artist:'Mellow Company',source:'TikTok',created_at:new Date(now-2*86400000).toISOString(),album_art_url:'',spotify_url:'https://open.spotify.com/track/demo3'},
 {id:'4',song:'Golden Hour',artist:'Paper Planes',source:'Instagram',created_at:new Date(now-3*86400000).toISOString(),album_art_url:artwork('GOLDEN HOUR','#9b783c',0),spotify_url:'https://open.spotify.com/track/demo4'},
 {id:'5',song:'Somewhere, Soon',artist:'Open Windows',source:'YouTube',created_at:new Date(now-8*86400000).toISOString(),album_art_url:artwork('SOMEWHERE','#40456c',1)},
 {id:'6',song:'Lost in the Light',artist:'Soft Signal',source:'Instagram',created_at:'invalid-date',album_art_url:'/missing-demo-art.jpg',spotify_url:'https://open.spotify.com/track/demo6'},
];
function Preview() {
 const params=new URLSearchParams(location.search);
 const mode=params.get('state');
 const [history,setHistory]=useState(mode==='empty'||mode==='loading'||mode==='error'?[]:seed);
 const [loading,setLoading]=useState(mode==='loading');
 const [error,setError]=useState(mode==='error'?'Check your connection and try again.':'');
 const [refreshes,setRefreshes]=useState(0);
 const [streak,setStreak]=useState(4);
 return <MotionConfig reducedMotion="user">
 <div style={{background:'#181818',color:'#b3b3b3',fontSize:10,textAlign:'center',padding:8}} data-testid="preview-label">Design preview · sample songs · no live saves <span data-testid="refresh-count">Refreshes: {refreshes}</span><button style={{marginLeft:12}} onClick={()=>setStreak(value=>value+1)}>Update streak</button></div>
 <AppView initialTab="library" userName="Sahil" history={history} songsThisWeek={4} streak={streak} isLoadingHistory={loading} historyError={error} onRefreshHistory={async()=>{setRefreshes(value=>value+1);await new Promise(resolve=>setTimeout(resolve,500));setLoading(false);setError('');setHistory(seed);}} autoAddTopMatch={true} defaultPlaylistId="liked_songs" playlists={[]} theme="dark" onLogout={()=>{}} onStashSubmit={async()=>{}} onDeleteSong={id=>setHistory(prev=>prev.filter(song=>song.id!==id))} onToggleAutoAdd={()=>{}} onToggleTheme={()=>{}} onOpenSettings={()=>{}} onOpenStats={()=>{}} />
 </MotionConfig>;
}
createRoot(document.getElementById('root')!).render(<Preview />);
