import React from "react";
import { createContext, useContext, useEffect, useState } from "react";

const responsiveContext = createContext({
  width: window.innerWidth,
  height: window.innerHeight,
});

export const ResponsiveProvider = ({ children }: any) => {
  // This is the exact same logic that we previously had in our hook

  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  const handleResize = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <responsiveContext.Provider value={{ width, height }}>
      {children}
    </responsiveContext.Provider>
  );
};

function useResponsive() {
  const { width, height } = useContext(responsiveContext);
  return { width, height };
}

export default useResponsive;
