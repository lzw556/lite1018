export function GetParamValue(search: string, key: string) {
  const index = search.indexOf('?');
  if (index >= 0) {
    const params = search.substring(index + 1);
    const locale = params.split('&').find((item: string) => item.indexOf(key) >= 0);
    if (locale && locale.split('=').length === 2) {
      return locale.split('=')[1];
    }
  }
}

export function getViewNameFromLocation(location: any): string {
  let name = location.pathname;
  const paths = location.search.replace('?locale=', '').split('/');
  if (paths.length > 0) {
    const path = paths[paths.length - 1];
    const paras = path.split('&');
    if (paras.length > 0) name = paras[0];
  }
  return name;
}

export function pickPathsFromLocation(search: string) {
  const paths: { name: string; search: string }[] = [];
  search.split('/').forEach((path, index) => {
    let name = '';
    if (path.indexOf('&') > -1) {
      name = path.split('&')[0];
    } else if (path.indexOf('=') > -1) {
      name = path.split('=')[1];
    } else {
      name = path;
    }
    const prev = paths.length > 0 ? paths[index - 1].search + '/' : '';
    paths.push({ name, search: `${prev}${path}` });
  });
  return paths;
}
