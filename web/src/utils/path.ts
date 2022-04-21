
export function GetParamValue(search: string, key:string) {
    const index = search.indexOf("?")
    if (index >= 0) {
        const params = search.substring(index+1)
        const locale = params.split("&").find((item:string) => item.indexOf(key) >= 0)
        if (locale && locale.split("=").length === 2) {
            return locale.split("=")[1]
        }
    }
}

type SubPath = {pathname:string; para:string};
export function getSubPathsFromSearch(search: string): SubPath[]{
    const paths: SubPath[] = [];
    search.replace('?locale=', '').split('/').forEach(para=>{
        const paras = para.split('&')
        paths.push({pathname:paras[0] ?? '', para:paras[1] ?? ''})
    })
    return paths;
}

export function pickPathsFromLocation(search: string) {
  const paths: { name: string; search: string }[] = [];
  search.split('/').forEach((path, index) => {
    let name = '';
    if (path.indexOf('&') > -1) {
      name = path.split('&')[0];
    } else if (path.indexOf('=') > -1) {
      name = path.split('=')[1];
    }
    const prev = paths.length > 0 ? paths[index - 1].search + '/' : '';
    paths.push({ name, search: `${prev}${path}` });
  });
  return paths;
}