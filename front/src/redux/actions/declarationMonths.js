import superagent from 'superagent'
import {
  FETCH_ACTIVE_DECLARATION_MONTHS_LOADING,
  FETCH_ACTIVE_DECLARATION_MONTHS_SUCCESS,
  FETCH_ACTIVE_DECLARATION_MONTHS_FAILURE,
} from './actionNames'

export const fetchDeclarationMonths = () => (dispatch) => {
  dispatch({ type: FETCH_ACTIVE_DECLARATION_MONTHS_LOADING })
  return superagent
    .get('/api/declarationMonths/finished')
    .then((res) => {
      const declarationsMonth = res.body
      dispatch({
        type: FETCH_ACTIVE_DECLARATION_MONTHS_SUCCESS,
        payload: declarationsMonth,
      })
    })
    .catch((err) =>
      dispatch({ type: FETCH_ACTIVE_DECLARATION_MONTHS_FAILURE, payload: err }),
    )
}
