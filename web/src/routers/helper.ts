import { Menu } from '../types/menu';

export function verifyMenu(menu: Menu, name: string, pathname: string): Menu | undefined {
  if (menu.path) {
    if (menu.name === name && menu.path === pathname) {
      return menu;
    } else if (menu.children.length > 0) {
      return menu.children.find((child) => verifyMenu(child, name, pathname));
    }
  }
  return undefined;
}

export function findMenu(menus: Menu[], name: string, pathname: string): Menu | undefined {
  let menu: Menu | undefined = undefined;
  for (let index = 0; index < menus.length; index++) {
    let _menu: Menu | undefined = menus[index];
    _menu = verifyMenu(_menu, name, pathname);
    if (_menu) {
      menu = _menu;
      break;
    }
  }
  return menu;
}
