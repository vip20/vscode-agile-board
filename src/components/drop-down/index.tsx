import { useState, useEffect, useRef } from "react";
import * as React from "react";
import { CSSTransition } from "react-transition-group";
import "./index.scss";
import {
  VscArrowLeft,
  VscChevronRight,
  VscFlame,
  VscSettingsGear,
} from "react-icons/vsc";
import * as t from "../../core/types";
import classNames from "classnames";

const startCase = require("lodash.startcase");

export default function DropdownMenu(menu: t.DropdownMenu) {
  const [activeMenu, setActiveMenu] = useState("main");
  const [menuHeight, setMenuHeight] = useState<number>(0);
  const dropdownRef = useRef<any>(null);

  useEffect(() => {
    if (dropdownRef && dropdownRef.current) {
      setMenuHeight(dropdownRef.current.firstChild.offsetHeight);
    }
  }, []);

  function calcHeight(el: HTMLElement) {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }

  function DropdownItem(props: t.DropdownItem) {
    function itemClick() {
      if (!props.isDisabled) {
        if (props.callbackFn) {
          props.callbackFn();
        }
        if (props.goToMenu) {
          setActiveMenu(props.goToMenu);
        }
      }
    }
    const menuClass = classNames({
      "menu-item": true,
      disabled: props.isDisabled,
    });
    return (
      <a href="#" className={menuClass} onClick={() => itemClick()}>
        <span className="icon-button">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right">{props.rightIcon}</span>
      </a>
    );
  }

  const primaryItems =
    menu.primary && menu.primary.main ? menu.primary.main : null;
  const secondaryKeys = menu.secondary ? Object.keys(menu.secondary) : null;

  return (
    <div className="dropdown" style={{ height: menuHeight }} ref={dropdownRef}>
      {primaryItems && (
        <CSSTransition
          in={activeMenu === "main"}
          timeout={500}
          classNames="menu-primary"
          unmountOnExit
          onEnter={calcHeight}
        >
          <div className="menu">
            {primaryItems.map((item) => {
              return <DropdownItem {...item} />;
            })}
          </div>
        </CSSTransition>
      )}

      {secondaryKeys &&
        secondaryKeys.length > 0 &&
        secondaryKeys.map((k) => {
          let currentSecMenu =
            menu.secondary && menu.secondary[k] ? menu.secondary[k] : [];
          return (
            <CSSTransition
              in={activeMenu === `${k}`}
              timeout={500}
              classNames="menu-secondary"
              unmountOnExit
              onEnter={calcHeight}
            >
              <div className="menu">
                <DropdownItem goToMenu="main" leftIcon={<VscArrowLeft />}>
                  <h3>{startCase(k)}</h3>
                </DropdownItem>
                {currentSecMenu.map((item) => (
                  <DropdownItem {...item} />
                ))}
              </div>
            </CSSTransition>
          );
        })}
    </div>
  );
}
