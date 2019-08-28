import superagent from 'superagent'
import {
  FETCH_ACTIVE_MONTH_LOADING,
  FETCH_ACTIVE_MONTH_SUCCESS,
  FETCH_ACTIVE_MONTH_FAILURE,
} from './actionNames'

export const fetchActiveMonth = () => (dispatch) => {
  dispatch({ type: FETCH_ACTIVE_MONTH_LOADING })
  return superagent
    .get('/api/declarationMonths?active')
    .then((res) => {
      const activeMonth = (res.body && new Date(res.body)) || null
      dispatch({ type: FETCH_ACTIVE_MONTH_SUCCESS, payload: activeMonth })
    })
    .catch((err) =>
      dispatch({ type: FETCH_ACTIVE_MONTH_FAILURE, payload: err }),
    )
}
