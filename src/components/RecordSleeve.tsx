import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { AudioLines, ArrowUpRight } from 'lucide-react';
import { Vinyl } from './Vinyl';

export function RecordSleeve() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [14, -14]);
  return <motion.div ref={ref} className="record-package" style={{ y: reduced ? 0 : y }} aria-hidden="true">
    <motion.div className="record-package-inner" initial={reduced ? false : 'hidden'} animate="rest"
      whileHover={reduced ? undefined : 'hover'} whileTap={reduced ? undefined : 'hover'}
      variants={{hidden:{opacity:0,rotate:-6,y:24},rest:{opacity:1,rotate:-3,y:0},hover:{rotate:0,y:-6}}}
      transition={{ duration: reduced ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}>
      <motion.div className="sleeve-disc" variants={{
        hidden:{x:'0%',rotate:-35},
        rest:{x:'38%',rotate:12,transition:{duration:reduced?0:1.25,delay:reduced?0:.2,ease:[.22,1,.36,1]}},
        hover:{x:'42%',rotate:25,transition:{duration:.45,ease:[.22,1,.36,1]}},
      }}>
        <Vinyl />
      </motion.div>
      <div className="record-sleeve">
        <div className="sleeve-top"><span>STASH RECORDS</span><ArrowUpRight size={18} /></div>
        <div className="sleeve-title">THE<br />GOOD<br /><span>FINDS.</span></div>
        <div className="sleeve-orbits"><i /><i /><i /><i /></div>
        <div className="sleeve-bottom"><AudioLines size={22} /><span>VOL. 01<br />KEEP WHAT MOVES YOU.</span></div>
      </div>
    </motion.div>
    <div className="sleeve-caption"><span>YOUR FINDS. ON REPEAT.</span><span>33⅓ RPM</span></div>
  </motion.div>;
}
