import superagent from 'superagent'

import catchMaintenance from '../../lib/catchMaintenance'
import {
  FETCH_USER_LOADING,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILURE,
} from './actionNames'

export const fetchUser = () => (dispatch) => {
  dispatch({ type: FETCH_USER_LOADING })
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

      dispatch({ type: FETCH_USER_SUCCESS, payload: user })
    })
    .catch(catchMaintenance)
    .catch((err) => {
      // if not logged in, resolve with null
      if (err.status !== 401) {
        return dispatch({ type: FETCH_USER_FAILURE, payload: err })
      }
      dispatch({ type: FETCH_USER_SUCCESS, payload: null })
    })
}

export const setEmail = (email) => (dispatch) => {
  dispatch({ type: 'SET_EMAIL', payload: { email } })
}

export const setNoNeedOnBoarding = () => (dispatch) => {
  dispatch({ type: 'SET_NO_NEED_ON_BOARDING' })
}

export const setNoNeedEmployerOnBoarding = () => (dispatch) => {
  dispatch({ type: 'SET_NO_NEED_EMPLOYER_ON_BOARDING' })
}
