export function getToken(): string {
  const parseCookie = (str: string) =>
    str
      .split(';')
      .map((v) => v.split('='))
      .reduce((acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim())
        return acc
      }, {})
  const cookie = parseCookie(document.cookie)
  const token = cookie['XSRF-TOKEN']
  return token
}
