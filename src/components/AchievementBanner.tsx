import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Disc3 } from './stitch/StashIcons';
const milestones = [{id:'first-stash',target:1,title:'First Stash!',description:'Your collection has officially started.'},{id:'collector',target:10,title:'Collector',description:'Ten good finds. A collection taking shape.'},{id:'music-lover',target:25,title:'Music Lover',description:'Twenty-five songs worth keeping.'},{id:'curator',target:50,title:'Curator',description:'Fifty finds. That’s a taste of your own.'}];
export function AchievementBanner({totalSongs}:{totalSongs:number}) {
  const [achievement,setAchievement] = useState<typeof milestones[number] | null>(null);
  const previous = useRef(totalSongs);
  const reduced = useReducedMotion();
  useEffect(()=>{
    if(totalSongs > previous.current) {
      const reached = [...milestones].reverse().find(item=>totalSongs>=item.target && previous.current<item.target && !localStorage.getItem(`achievement-${item.id}-shown`));
      if(reached) { localStorage.setItem(`achievement-${reached.id}-shown`,'true');setAchievement(reached); }
    }
    previous.current=totalSongs;
  },[totalSongs]);
  useEffect(()=>{if(!achievement)return;const timer=setTimeout(()=>setAchievement(null),5000);return()=>clearTimeout(timer);},[achievement]);
  const next = milestones.find(item=>totalSongs<item.target);
  return <>
    {achievement && <div className="milestone-toast" role="status"><motion.div initial={reduced?false:{opacity:0,y:-12}} animate={{opacity:1,y:0}}><p><CheckCircle2 size={18}/>{achievement.title}</p><span>{achievement.description}</span></motion.div></div>}
    {next && <div className="library-milestone"><Disc3 size={24} aria-hidden="true"/><div><strong>Next up: {next.title.replace('!','')}</strong><p>{totalSongs} of {next.target} songs. Keep following your ears.</p></div><div className="milestone-track" aria-hidden="true"><motion.div initial={false} animate={{scaleX:totalSongs/next.target}} transition={{duration:reduced?0:.5}} /></div></div>}
  </>;
}
