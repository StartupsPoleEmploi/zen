import superagent from 'superagent'

export const getUser = () =>
  superagent
    .get('/api/user')
    .then((res) => res.body)
    .catch((err) => {
      // if not logged in, resolve with null
      if (err.status !== 401) throw err
      return null
    })
