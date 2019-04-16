"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
} // helper component


function useSubmenu() {
  var _useState = (0, _react.useState)({}),
      _useState2 = _slicedToArray(_useState, 2),
      style = _useState2[0],
      setStyle = _useState2[1];

  var ref = (0, _react.useRef)(null);
  return {
    style: style,
    setStyle: setStyle,
    ref: ref
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


function useContextMenu() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var defaultSettings = {
    submenuSymbol: '>',
    depth: 3,
    onOpen: function onOpen() {},
    onClose: function onClose() {} // maxHeight: undefined,

  };
  props = Object.assign(defaultSettings, props);

  var _useState3 = (0, _react.useState)({}),
      _useState4 = _slicedToArray(_useState3, 2),
      menuConfig = _useState4[0],
      setMenuConfig = _useState4[1];

  var _useState5 = (0, _react.useState)({
    top: 0,
    left: 0
  }),
      _useState6 = _slicedToArray(_useState5, 2),
      location = _useState6[0],
      setLocation = _useState6[1]; // click location


  var _useState7 = (0, _react.useState)({
    top: 0,
    left: 0
  }),
      _useState8 = _slicedToArray(_useState7, 2),
      adjLoc = _useState8[0],
      setAdjLoc = _useState8[1]; // adjusted location


  var _useState9 = (0, _react.useState)(null),
      _useState10 = _slicedToArray(_useState9, 2),
      path = _useState10[0],
      setPath = _useState10[1]; // null or string[]


  var menuRef = (0, _react.useRef)(null);
  var submenus = Array.apply(null, {
    length: props.depth
  }).map(function (e) {
    return useSubmenu();
  });
  (0, _react.useLayoutEffect)(function () {
    registerListeners();
    setAdjLoc(adjustMenuPosition(menuRef));
    submenus.forEach(function (submenu) {
      return submenu.setStyle({});
    });
    props.onOpen();
    return unregisterListeners;
  }, [location]);
  (0, _react.useLayoutEffect)(function () {
    submenus.forEach(function (submenu) {
      if (!submenu.ref || !submenu.ref.current) return;
      var style = adjustSubmenuPosition(submenu.ref);

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
    var minpath = Math.min(currentPath.length, path.length);
    var i = 0;

    for (; i < minpath; i++) {
      if (path[i] !== currentPath[i]) break;
    }

    for (; i < submenus.length; i++) {
      submenus[i].setStyle({}); // reset styles
    } // set path


    setPath(currentPath);
  }

  function adjustSubmenuPosition(submenuRef) {
    if (submenuRef.current === null) {
      return {};
    }

    var _window = window,
        windowWidth = _window.innerWidth,
        windowHeight = _window.innerHeight;

    var _getRect = getRect(submenuRef.current),
        width = _getRect.width,
        height = _getRect.height,
        x = _getRect.x,
        y = _getRect.y;

    var style = {};

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
      return {
        left: 0,
        top: 0
      };
    }

    var _window2 = window,
        windowWidth = _window2.innerWidth,
        windowHeight = _window2.innerHeight;
    var _menuRef$current = menuRef.current,
        menuWidth = _menuRef$current.offsetWidth,
        menuHeight = _menuRef$current.offsetHeight;
    var left = location.left,
        top = location.top;

    if (left + menuWidth > windowWidth) {
      left = windowWidth - menuWidth;
    }

    if (top + menuHeight > windowHeight) {
      top = windowHeight - menuHeight;
    }

    return {
      left: left,
      top: top
    };
  }
  /*  renderMenuItem
      - current path: is the current menu path
      - remaining paht: is the remaining path left after traversing
  */


  function renderMenuItem(_ref, currentPath, remainingPath, i) {
    var _ref2 = _slicedToArray(_ref, 2),
        itemName = _ref2[0],
        itemValue = _ref2[1];

    // render function
    if (typeof itemValue === 'function') {
      // attach cb to menu item
      return _react["default"].createElement("div", {
        key: itemName,
        className: "menuItem",
        onMouseDown: function onMouseDown() {
          return itemValue(itemName);
        },
        onMouseEnter: handleHover.bind(this, currentPath)
      }, itemName);
    } // render jsx


    if (_react["default"].isValidElement(itemValue)) {
      return _react["default"].createElement("div", {
        key: itemName,
        onMouseEnter: handleHover.bind(this, currentPath),
        onMouseDown: stopPropagation
      }, itemValue);
    } // render dom element


    if (itemValue instanceof Element || itemValue instanceof HTMLDocument) {
      // unsupported for now
      console.log('please dont use dom nodes');
    } // render disabled


    if (itemValue == null) {
      // render disabled
      return _react["default"].createElement("div", {
        key: itemName,
        className: "menuItem disabled"
      }, itemName);
    } // render submenu


    if (_typeof(itemValue) === 'object') {
      // check if open, recursively render
      if (remainingPath && remainingPath[0] === itemName) {
        // render submenu, menu class should be abs positioned
        return _react["default"].createElement("div", {
          key: itemName,
          className: "menuItem rightShift highlight flex"
        }, _react["default"].createElement("div", null, itemName), _react["default"].createElement("div", null, "\xA0\xA0", props.submenuSymbol), renderSubmenu(itemValue, [].concat(_toConsumableArray(currentPath), [itemName]), remainingPath.slice(1)));
      } // render submenu as a menuitem
      // todo: missing carat


      var handleHoverMenu = handleHover.bind(this, [].concat(_toConsumableArray(currentPath), [itemName]));
      return _react["default"].createElement("div", {
        key: itemName,
        className: "menuItem rightShift flex",
        onMouseEnter: handleHoverMenu
      }, _react["default"].createElement("div", null, itemName), _react["default"].createElement("div", null, "\xA0\xA0", props.submenuSymbol));
    } // render line separator


    var validString = typeof itemValue === 'string' && itemValue.length > 0;

    if (validString && itemValue.replace(/-|=/g, '') === '') {
      return _react["default"].createElement("hr", {
        key: 'line' + i
      });
    } // render disabled


    return _react["default"].createElement("div", {
      key: itemName,
      className: "menuItem disabled"
    }, itemName);
  }

  function renderSubmenu(menu, currentPath, remainingPath) {
    var submenu = submenus[currentPath.length - 1];
    return _react["default"].createElement("div", {
      ref: submenu.ref,
      className: "submenu",
      style: submenu.style
    }, Object.entries(menu).map(function (item, i) {
      return renderMenuItem(item, currentPath, remainingPath, i);
    }));
  }

  function renderMenu(menu, currentPath, remainingPath) {
    if (path === null) {
      return null;
    }

    return _react["default"].createElement("div", {
      ref: menuRef,
      className: "menu",
      style: adjLoc
    }, Object.entries(menu).map(function (item, i) {
      return renderMenuItem(item, currentPath, remainingPath, i);
    }));
  }

  function setContextMenu(menuConfig) {
    return function triggerContextMenu(e) {
      setMenuConfig(menuConfig);
      setLocation({
        left: e.pageX,
        top: e.pageY
      });
      setPath([]);
      e.preventDefault();
      e.stopPropagation();
    };
  }

  var m = path && renderMenu(menuConfig, [], path);

  var contextMenu = _reactDom["default"].createPortal(m, document.body);

  return [contextMenu, setContextMenu, closeMenu];
}

var _default = useContextMenu;
/* use case
  function MyComponent(props) {
    const [contextMenuRender, useContextMenu] = useContextMenu(...menu settings...);
    return <div onContextMenu={handleContextMenu}>my component{contextMenuRender}</div>
  }
*/

exports["default"] = _default;
