export const sayswho = () => {
  const ua = navigator.userAgent; let tem;
  let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return `IE ${tem[1] || ''}`;
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  tem = ua.match(/version\/(\d+)/i);
  if (tem != null) M.splice(1, 1, tem[1]);
  return M;
};

export const hasFileBrokenByNavigator = () => {
  const [navigator, version] = sayswho()
  if (navigator === "Chrome" && +version <= 49) {
    return true
  }

  return false
}