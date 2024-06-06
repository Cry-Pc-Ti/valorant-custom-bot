// eslint-disable-next-line @typescript-eslint/ban-types
export const debounce = (func: Function, wait: number, immediate = false) => {
  let timeout: NodeJS.Timeout | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: any, ...args: any[]) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
};
