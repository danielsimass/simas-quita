import { useCallback, useState } from 'react';
import type { ToastActionElement, ToastProps } from '../components/ui/toast';

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
};

type ToastInput = Omit<ToasterToast, 'id'>;

let toastCount = 0;

function createToastId(): string {
  toastCount += 1;
  return String(toastCount);
}

export function useToast() {
  const [toasts, setToasts] = useState<ToasterToast[]>([]);

  const dismiss = useCallback((toastId: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = createToastId();
      const nextToast: ToasterToast = { ...input, id, open: true };

      setToasts((current) => [nextToast, ...current].slice(0, TOAST_LIMIT));

      window.setTimeout(() => dismiss(id), TOAST_REMOVE_DELAY);
      return id;
    },
    [dismiss],
  );

  return { toasts, toast, dismiss };
}
