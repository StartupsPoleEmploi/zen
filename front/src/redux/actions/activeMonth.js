import superagent from 'superagent'

import catchMaintenance from '../../lib/catchMaintenance'
import {
  FETCH_ACTIVE_MONTH_LOADING,
  FETCH_ACTIVE_MONTH_SUCCESS,
  FETCH_ACTIVE_MONTH_FAILURE,
} from './actionNames'

export const fetchActiveMonth = () => (dispatch) => {
  dispatch({ type: FETCH_ACTIVE_MONTH_LOADING })
  return superagent
    .get('/api/declarationMonths?active=true')
    .then((res) => {
      const activeMonth = (res.body && new Date(res.body)) || null
      dispatch({ type: FETCH_ACTIVE_MONTH_SUCCESS, payload: activeMonth })
    })
    .catch(catchMaintenance)
    .catch((err) =>
      dispatch({ type: FETCH_ACTIVE_MONTH_FAILURE, payload: err }),
    )
}
