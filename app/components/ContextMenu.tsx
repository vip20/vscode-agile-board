import * as t from '../../src/core/types';
import React from 'react';
import DropdownMenu from './Dropdown';
import ReactDOM from 'react-dom';

type ContextMenuProps = {
  dropdownMenu: t.DropdownMenu;
  xPos: string;
  yPos: string;
};

export const ContextMenu = React.forwardRef((props: ContextMenuProps, ref: any) => {
  return ReactDOM.createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: props.yPos,
        left: props.xPos,
        zIndex: 10,
      }}
    >
      <DropdownMenu {...props.dropdownMenu}></DropdownMenu>
    </div>,
    document.getElementById('context-menu-root')!
  );
});
