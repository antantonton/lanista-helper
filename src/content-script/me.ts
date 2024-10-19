import { Me } from 'src/app/shared/services/me-api.service'
import { getToken } from './lanista'
import { LANISTA_BASE_URL } from 'src/app/shared/constants/lanista.constants'

export async function getMe(): Promise<Me> {
  const token = getToken()

  const me = await fetch(`${LANISTA_BASE_URL}/api/users/me`, {
    headers: {
      'x-xsrf-token': token,
    },
    method: 'GET',
  }).then((response) => response.json())

  return me
}

// Activate character in stable call
// fetch("https://beta.lanista.se/api/users/me/avatars/stable/78/active", {
//   "headers": {
//     "accept": "application/json",
//     "accept-language": "sv,en-US;q=0.9,en;q=0.8,sv-SE;q=0.7,nb;q=0.6,da;q=0.5,de;q=0.4",
//     "priority": "u=1, i",
//     "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin",
//     "x-requested-with": "XMLHttpRequest",
//     "x-socket-id": "483367543.749097117",
//     "x-xsrf-token": "eyJpdiI6Im8yS2pKb1JzNFlKSE5ESkNkM2twZVE9PSIsInZhbHVlIjoiTk9vRVFJelRZU2NJMngxWVdFUTNaSWN0cm9VYTNDMmJCcHBQZHZ4L21HcXQ4dmJxanJzb05Ub2pXakhTakRPTkQ5eDZXUHN0K2NtcENHaS9BUWZNdStFY21XKzVETCtsNzlXUTlpN0hMRlhTRytNbWtONkYrSG0vaC9IaFYxdDAiLCJtYWMiOiI0NmY5Y2RhYjJkNTY5NTRkMjYxZmQzNWUxMGI1MDIzNmZkMTZlODJlNTM1YTRlMGZiMjgyZGQ2ZTYwZjViMzc1IiwidGFnIjoiIn0="
//   },
//   "referrer": "https://beta.lanista.se/game/avatar/me/info",
//   "referrerPolicy": "strict-origin-when-cross-origin",
//   "body": null,
//   "method": "PUT",
//   "mode": "cors",
//   "credentials": "include"
// });
