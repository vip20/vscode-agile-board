import { useEffect } from "react";

const useOutsideClick = (ref: any, callback: Function) => {
  const handleClick = (e: any) => {
    console.log(ref.current);
    console.log(e.target);
    if (ref.current.contains(e.target)) {
      return;
    }
    callback();
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  });
};

export default useOutsideClick;
