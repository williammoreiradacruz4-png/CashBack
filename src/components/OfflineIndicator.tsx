import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-950 shadow-md"
    >
      <WifiOff className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
      <span>Modo offline — Seus depósitos continuam salvos localmente.</span>
    </div>
  );
}
