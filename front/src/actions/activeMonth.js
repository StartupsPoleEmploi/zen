import superagent from 'superagent'
import {
  LOAD_ACTIVE_MONTH_LOADING,
  LOAD_ACTIVE_MONTH_SUCCESS,
  LOAD_ACTIVE_MONTH_FAILURE,
} from './actionNames'

export const fetchActiveMonth = () => (dispatch) => {
  dispatch({ type: LOAD_ACTIVE_MONTH_LOADING })
  return superagent
    .get('/api/declarationMonths?active')
    .then((res) => {
      const activeMonth = (res.body && new Date(res.body)) || null
      dispatch({ type: LOAD_ACTIVE_MONTH_SUCCESS, payload: activeMonth })
    })
    .catch((err) => dispatch({ type: LOAD_ACTIVE_MONTH_FAILURE, payload: err }))
}
