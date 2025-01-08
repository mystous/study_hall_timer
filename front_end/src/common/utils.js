import { toast } from 'react-toastify';

export const showToastOnce = (message) => {
    // toast.isActive를 사용하여 현재 활성화된 toast 확인
    if (!toast.isActive(message)) {
      toast(message, {
        toastId: message, // 메시지를 ID로 사용
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

