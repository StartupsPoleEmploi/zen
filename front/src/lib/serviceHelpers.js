import { get } from 'lodash';
import { SET_USER_LOGGED_OUT } from '../redux/actions/actionNames';

export function manageErrorCsrfToken(err, dispatch) {
  if (
    err.status === 403 &&
    get(err, 'response.body.code') === 'EBADCSRFTOKEN'
  ) {
    dispatch({ type: SET_USER_LOGGED_OUT, payload: err });
    return true;
  }
  return false;
}
