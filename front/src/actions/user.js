import superagent from 'superagent'
import { USER_LOADING, USER_SUCCESS, USER_FAILURE } from './actionNames'

export const fetchUser = () => (dispatch) => {
  dispatch({ type: USER_LOADING })
  return superagent
    .get('/api/user')
    .then((res) => {
      const user = res.body

      if (!user.isTokenValid) {
        window.location = '/api/login'
        return
      }

      window.Raven.setUserContext({
        id: user.id,
      })

      dispatch({ type: USER_SUCCESS, payload: user })
    })
    .catch((err) => {
      // if not logged in, resolve with null
      if (err.status !== 401) dispatch({ type: USER_FAILURE, payload: err })
      dispatch({ type: USER_SUCCESS, payload: null })
    })
}
