import { toast } from 'react-hot-toast';

export const useToast = () => {
  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);
  const info = (message: string) => toast(message, { icon: 'ℹ️' });
  const warning = (message: string) => toast(message, { icon: '⚠️' });

  return { success, error, info, warning };
};

export default useToast;
