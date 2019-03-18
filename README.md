# ContextMenu
ContextMenu is a context menu build on React (16.8+) hooks. ContextMenu provides a quick and easy way to create instant context menus without having to build jsx. This component supports submenus, custom component menu items, and edge detection.

## Installation
Using npm:
```shell
$ npm i contextmenu
```

## How To Use
Import:
```jsx
import useContextMenu from 'contextmenu';
import 'contextmenu/ContextMenu.css';
```

Build out your menu:
```jsx
const menuConfig = {
  'Say open': () => console.log('open'),
  'Disabled': null,
  'JSX line': <hr></hr>,
  'JSX': <div style={{height: 40, border: '1px solid green'}}>yes</div>,
  'Line': '---',
  'Submenu': {
    'Say wololol': () => console.log('wololol'),
    'Go deeper': {
      'Onceptioniningiong': () => console.log('inceptioniningiong'),
    },
    'Submenu 2': {
      'electric': console.log,
      'boogaloo': () => console.log('boogaloo'), 
    },
  },
};
```

Render your menu in your component:
```jsx
  const [contextMenu, useCM] = useContextMenu({ submenuSymbol: 'O' });
  return <div onContextMenu={useCM(menuConfig)}>{...}</div>
```
