/**
 * Toast hook for notifications
 * Simple implementation using browser alerts for now
 * In production, you'd want to use a proper toast library like sonner
 */

export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = ({ title, description, variant }: Toast) => {
    const message = description ? `${title}: ${description}` : title;
    
    if (variant === 'destructive') {
      console.error(message);
      alert(`Error: ${message}`);
    } else {
      console.log(message);
      alert(message);
    }
  };

  return { toast };
}