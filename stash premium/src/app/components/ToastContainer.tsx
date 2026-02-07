import { useEffect } from 'react';
import { Toast } from '../types';
import { CircleCheck, CircleX } from 'lucide-react';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full px-4">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: number) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm
        animate-slide-in-up
        ${isSuccess
          ? 'bg-green-900/90 border-green-700 text-green-100'
          : 'bg-red-900/90 border-red-700 text-red-100'
        }
      `}
    >
      {isSuccess ? (
        <CircleCheck className="w-5 h-5 flex-shrink-0" />
      ) : (
        <CircleX className="w-5 h-5 flex-shrink-0" />
      )}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-current hover:opacity-70 transition-opacity"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}