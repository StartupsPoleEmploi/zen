import superagent from 'superagent'
import {
  FETCH_STATUS_LOADING,
  FETCH_STATUS_SUCCESS,
  FETCH_STATUS_FAILURE,
} from './actionNames'
import catchMaintenance from '../../lib/catchMaintenance'

export const fetchStatus = () => (dispatch) => {
  dispatch({ type: FETCH_STATUS_LOADING })
  return superagent
    .get('/api/status')
    .then((res) =>
      dispatch({
        type: FETCH_STATUS_SUCCESS,
        payload: {
          serviceUp: !!res.body.global.up,
          filesUp: !!res.body.files.up,
        },
      }),
    )
    .catch(catchMaintenance)
    .catch((err) => dispatch({ type: FETCH_STATUS_FAILURE, payload: err }))
}
