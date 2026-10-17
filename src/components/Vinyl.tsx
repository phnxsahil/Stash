import { StashLogo } from './stitch/StashUI';
export function Vinyl({ spinning = false }: { spinning?: boolean }) {
  return <div aria-hidden="true" className={`capture-vinyl ${spinning ? 'is-spinning' : ''}`}>
    <div className="vinyl-label"><StashLogo wordmark={false} size={24} /><span>STASH</span><i /></div>
  </div>;
}
