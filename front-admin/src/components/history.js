/**
 * Update URL without refresh
 */
export default function updateUrl(url) {
  window.history.pushState({}, window.title, url)
}

export function getUrlParams(name) {
  const url = new URL(window.location)
  const params = new URLSearchParams(url.search)
  return params.get(name)
}
