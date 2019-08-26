import superagent from 'superagent'
import {
  LOAD_STATUS_LOADING,
  LOAD_STATUS_SUCCESS,
  LOAD_STATUS_FAILURE,
} from './actionNames'

export const fetchStatus = () => (dispatch) => {
  dispatch({ type: LOAD_STATUS_LOADING })
  return superagent
    .get('/api/status')
    .then((res) =>
      dispatch({ type: LOAD_STATUS_SUCCESS, payload: !!res.body.up }),
    )
    .catch((err) => dispatch({ type: LOAD_STATUS_FAILURE, payload: err }))
}
