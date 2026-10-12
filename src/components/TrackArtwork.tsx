import {useEffect,useState} from 'react';
import {Disc3,Music2} from 'lucide-react';
export function TrackArtwork({url}:{url?:string}) {
 const [failed,setFailed]=useState(false);
 useEffect(()=>setFailed(false),[url]);
 return <div className="track-artwork">
   {url && !failed ? <img src={url} alt="" width={240} height={240} loading="lazy" decoding="async" onError={()=>setFailed(true)} /> : <div className="artwork-fallback" aria-label="Album artwork unavailable"><Disc3 size={36}/></div>}
   <span className="track-artwork-mark" aria-hidden="true"><Music2 size={16}/></span>
 </div>;
}
