import { useEffect } from "react";

const useOutsideClick = (ref: any, callback: Function) => {
  const handleClick = (e: any) => {
    console.log(ref.current);
    console.log(e.target);
    if (!ref.current || ref.current.contains(e.target)) {
      return;
    }
    callback();
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.addEventListener("touchstart", handleClick);
    };
  });
};

export default useOutsideClick;
