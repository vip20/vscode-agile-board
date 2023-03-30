import { useEffect } from "react";

const useOutsideScroll = (ref: any, callback: Function) => {
  const handleScroll = (e: any) => {
    if (!ref.current || ref.current.contains(e.target)) {
      return;
    }
    callback();
  };

  useEffect(() => {
    document.addEventListener("wheel", handleScroll);

    return () => {
      document.removeEventListener("wheel", handleScroll);
    };
  });
};

export default useOutsideScroll;
