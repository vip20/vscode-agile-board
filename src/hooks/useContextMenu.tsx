import { useCallback, useState, useEffect, Ref, useRef } from "react";
import useOutsideClick from "./useOutsideClick";
import useOutsideScroll from "./useOutsideScroll";

export const useContextMenu = (
  outerRef: React.MutableRefObject<any>,
  innerRef: React.MutableRefObject<any>,
  xOffset: number = 0,
  yOffset: number = 0
) => {
  const [xPos, setXPos] = useState("0px");
  const [yPos, setYPos] = useState("0px");
  const [showMenu, setShowMenu] = useState(false);
  const [itemId, setItemId] = useState<any>(null);

  useOutsideClick(innerRef, () => {
    setShowMenu(false);
  });
  useOutsideScroll(innerRef, () => {
    setShowMenu(false);
  });
  const handleContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      if (outerRef && outerRef.current.contains(e.target)) {
        setXPos(`${e.pageX + xOffset}px`);
        setYPos(`${e.pageY + yOffset}px`);
        // Do comment if you find any alternative for below line
        const target = e.target.closest(".task-card-parent");
        if (target) {
          setShowMenu(true);
          setItemId(target.id);
        }
      } else {
        setItemId(false);
        setShowMenu(false);
      }
    },
    [setXPos, setYPos]
  );

  // const handleClick = useCallback(
  //   (e) => {
  //     showMenu && setShowMenu(false);
  //   },
  //   [showMenu]
  // );

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  });

  return { xPos, yPos, showMenu, itemId, setShowMenu };
};
