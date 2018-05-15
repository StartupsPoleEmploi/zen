import superagent from 'superagent'

export const getUser = () => superagent.get('/api/user').then(res => res.body)
