import * as t from "../../core/types";
import React from "react";
import DropdownMenu from "../drop-down";

type ContextMenuProps = {
  dropdownMenu: t.DropdownMenu;
  xPos: string;
  yPos: string;
};

export default function ContextMenu(props: ContextMenuProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: props.yPos,
        left: props.xPos,
        zIndex: 10,
      }}
    >
      <DropdownMenu {...props.dropdownMenu}></DropdownMenu>
    </div>
  );
}
