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

let groups = [];

export const isAdmin = () => {
  return groups.some(group => group.group_name === 'admin');
};


export const saveGroups = (array) => {
  groups = array;
};

export const getGroups = () => {
  return groups;
};

export const getContrastColor = (hexColor) => {
  if (!hexColor) return 'black';
  // Handle short hex code (e.g., #03F)
  const fullHex = hexColor.length === 4
    ? '#' + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2] + hexColor[3] + hexColor[3]
    : hexColor;

  const r = parseInt(fullHex.substr(1, 2), 16);
  const g = parseInt(fullHex.substr(3, 2), 16);
  const b = parseInt(fullHex.substr(5, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
};