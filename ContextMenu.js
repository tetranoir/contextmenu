/* eslint-disable no-use-before-define */
import React, { useState, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';


// tooling
function getRect(el) {
  if (!el) {
    return {};
  }
  return el.getBoundingClientRect();
}

function stopPropagation(e) {
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
}

// helper component
function useSubmenu() {
  const [style, setStyle] = useState({});
  const ref = useRef(null);
  return {
    style,
    setStyle,
    ref,
  };
}

/* useContextMenu - creates registers a context menu based on configuration, returns the trigger
  - menuConfig: used to build the menu jsx in setContextMenu(menuConfig). Shape -
    {
      [option name] :
        | [option cb]
        | [menu obj]
        | [jsx]
        | "-----"
        | null
    }
    option name is used in conjection with option cb to create an option that does something
    option name is used in conjection with menu obj to create a submenu
    option name is used with null when the item is disabled
    jsx shows custom renderings inside menu options (option name is unused here)
    jsx line is a shortcut to display a separation line between menu items (option name is unused)

  - settings:
    {
      submenuSymbol: the rhs of submenu items to distinguish from regular items
      depth: max number of sub menus
      onOpen: on open conext menu,
      onClose: on close context menu,
      // maxHeight: max height of menus and submenus in px
    }
*/
function useContextMenu(props = {}) {
  const defaultSettings = {
    submenuSymbol: '>',
    depth: 3,
    onOpen: () => {},
    onClose: () => {},
    // maxHeight: undefined,
  };
  props = Object.assign(defaultSettings, props);

  const [menuConfig, setMenuConfig] = useState({});
  const [location, setLocation] = useState({ top: 0, left: 0 }); // click location
  const [adjLoc, setAdjLoc] = useState({ top: 0, left: 0 }); // adjusted location
  const [path, setPath] = useState(null); // null or string[]
  const menuRef = useRef(null);
  const submenus = Array.apply(null, { length: props.depth }).map(e => useSubmenu());

  useLayoutEffect(() => {
    registerListeners();
    setAdjLoc(adjustMenuPosition(menuRef));
    submenus.forEach(submenu => submenu.setStyle({}));
    props.onOpen();
    return unregisterListeners;
  }, [location]);

  useLayoutEffect(() => {
    submenus.forEach(submenu => {
      if (!submenu.ref || !submenu.ref.current) return;
      const style = adjustSubmenuPosition(submenu.ref);
      if (Object.values(style).length > 0) {
        submenu.setStyle(style);
      }
    });
  }, [path]);

  function registerListeners() {
    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('touchstart', closeMenu);
    document.addEventListener('scroll', closeMenu);
    document.addEventListener('contextmenu', closeMenu);
    window.addEventListener('resize', closeMenu);
  }

  function unregisterListeners() {
    document.removeEventListener('mousedown', closeMenu);
    document.removeEventListener('touchstart', closeMenu);
    document.removeEventListener('scroll', closeMenu);
    document.removeEventListener('contextmenu', closeMenu);
    window.removeEventListener('resize', closeMenu);
  }

  function closeMenu() {
    unregisterListeners();
    setPath(null);
  }

  function handleHover(currentPath, e) {
    // reset some submenu styles here
    const minpath = Math.min(currentPath.length, path.length);
    let i = 0;
    for (; i < minpath; i++) {
      if (path[i] !== currentPath[i]) break;
    }
    for (;i < submenus.length; i++) {
      submenus[i].setStyle({}); // reset styles
    }
    // set path
    setPath(currentPath);
  }

  function adjustSubmenuPosition(submenuRef) {
    if (submenuRef.current === null) {
      return {};
    }

    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
    const { width, height, x, y } = getRect(submenuRef.current);

    const style = {};
    if (width + x > windowWidth) {
      style.right = 0;
      style.left = 'unset';
      style.marginRight = '100%';
    }
    if (height + y > windowHeight) {
      style.top = windowHeight - height - y - 3;
    }
    return style;
  }

  function adjustMenuPosition(menuRef) {
    if (menuRef.current === null) {
      return { left: 0, top: 0 };
    }

    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
    const { offsetWidth: menuWidth, offsetHeight: menuHeight } = menuRef.current;

    let { left, top } = location;

    if (left + menuWidth > windowWidth) {
      left = windowWidth - menuWidth;
    }

    if (top + menuHeight > windowHeight) {
      top = windowHeight - menuHeight;
    }

    return { left, top };
  }

  /*  renderMenuItem
      - current path: is the current menu path
      - remaining paht: is the remaining path left after traversing
  */
  function renderMenuItem([itemName, itemValue], currentPath, remainingPath, i) {
    // render function
    if (typeof itemValue === 'function') {
      // attach cb to menu item
      return (
        <div key={itemName}
          className="menuItem"
          onMouseDown={() => itemValue(itemName)}
          onMouseEnter={handleHover.bind(this, currentPath)}
        >
          {itemName}
        </div>
      );
    }

    // render jsx
    if (React.isValidElement(itemValue)) {
      return (
        <div
          key={itemName}
          onMouseEnter={handleHover.bind(this, currentPath)}
          onMouseDown={stopPropagation}
        >
          {itemValue}
        </div>
      );
    }

    // render dom element
    if (itemValue instanceof Element || itemValue instanceof HTMLDocument) {
      // unsupported for now
      console.log('please dont use dom nodes');
    }

    // render disabled
    if (itemValue == null) {
      // render disabled
      return <div key={itemName} className="menuItem disabled">{itemName}</div>;
    }

    // render submenu
    if (typeof itemValue === 'object') {
      // check if open, recursively render
      if (remainingPath && remainingPath[0] === itemName) {
        // render submenu, menu class should be abs positioned
        return (
          <div key={itemName} className="menuItem rightShift highlight flex">
            <div>{itemName}</div>
            <div>&nbsp;&nbsp;{props.submenuSymbol}</div>
            {renderSubmenu(itemValue, [...currentPath, itemName], remainingPath.slice(1))}
          </div>
        );
      }
      // render submenu as a menuitem
      // todo: missing carat
      const handleHoverMenu = handleHover.bind(this, [...currentPath, itemName]);
      return (
        <div key={itemName} className="menuItem rightShift flex" onMouseEnter={handleHoverMenu}>
          <div>{itemName}</div>
          <div>&nbsp;&nbsp;{props.submenuSymbol}</div>
        </div>
      );
    }

    // render line separator
    const validString = typeof itemValue === 'string' && itemValue.length > 0;
    if (validString && itemValue.replace(/-|=/g, '') === '') {
      return <hr key={'line' + i}/>;
    }

    // render disabled
    return <div key={itemName} className="menuItem disabled">{itemName}</div>;
  }

  function renderSubmenu(menu, currentPath, remainingPath) {
    const submenu = submenus[currentPath.length - 1];

    return (
      <div ref={submenu.ref} className="submenu" style={submenu.style}>
        {Object.entries(menu).map((item, i) => renderMenuItem(item, currentPath, remainingPath, i))}
      </div>
    );
  }

  function renderMenu(menu, currentPath, remainingPath) {
    if (path === null) {
      return null;
    }
    return (
      <div ref={menuRef} className="menu" style={adjLoc}>
        {Object.entries(menu).map((item, i) => renderMenuItem(item, currentPath, remainingPath, i))}
      </div>
    );
  }

  function setContextMenu(menuConfig) {
    return function triggerContextMenu(e) {
      setMenuConfig(menuConfig);
      setLocation({ left: e.pageX, top: e.pageY });
      setPath([]);

      e.preventDefault();
      e.stopPropagation();
    };
  }

  const m = path && renderMenu(menuConfig, [], path);
  const contextMenu = ReactDOM.createPortal(m, document.body);
  return [contextMenu, setContextMenu, closeMenu];
}

export default useContextMenu;

/* use case
  function MyComponent(props) {
    const [contextMenuRender, useContextMenu] = useContextMenu(...menu settings...);
    return <div onContextMenu={handleContextMenu}>my component{contextMenuRender}</div>
  }
*/
