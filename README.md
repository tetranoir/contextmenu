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
  return <div onContextMenu={useCM(menuConfig)}>{...}{contextMenu}</div>
```

## API
ContextMenu is built off hooks, which means you must render it within React functional components.

### useContextMenu(props)
 - `props` is optional
 - `props` shape:
```
{
  submenuSymbol: jsx; // which means jsx component or string or null
  depth: number;
  // more to be added later
}
```

### contextMenu
 - Returned from `useContextmenu()` which contains the `React.portal` to be rendered (onto `document.body`)
 - Must be in your render function, anywhere.

### useCM(menuConfig)
 - `menuConfig` is a **JSON** that determines what the rendered context menu looks like.
 - menuConfig shape:
```
{
  [menu option name] :
    | [option callback]
    | [menuConfig]
    | [jsx]
    | "-----"
    | null
}
```
 - **[menu option name]** is used in conjection with **[option callback]** to create an option that does something
 - **[menu option name]** is used in conjection with another `menuConfig` to create a submenu
 - **[menu option name]** is used with `null` when the item is disabled
 - **[jsx]** shows custom renderings inside menu options (**[menu option name]** is unused here)
 - **"---"** is a shortcut to display a separation line between menu items (**[menu option name]** is unused)
