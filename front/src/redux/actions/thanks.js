import {
  SHOW_SNACKBAR_UPLOAD_SUCCESS,
  HIDE_SNACKBAR_UPLOAD_SUCCESS,
  SHOW_SNACKBAR_ALREADY_KNOWN_SUCCESS,
  HIDE_SNACKBAR_ALREADY_KNOWN_SUCCESS,
} from './actionNames';

export const showSnackbarUpload = () => (dispatch) => {
  dispatch({ type: SHOW_SNACKBAR_UPLOAD_SUCCESS });
};

export const hideSnackbarUpload = () => (dispatch) => {
  dispatch({ type: HIDE_SNACKBAR_UPLOAD_SUCCESS });
};

export const showSnackbarAlreadyKnown = () => (dispatch) => {
  dispatch({ type: SHOW_SNACKBAR_ALREADY_KNOWN_SUCCESS });
};

export const hideSnackbarAlreadyKnown = () => (dispatch) => {
  dispatch({ type: HIDE_SNACKBAR_ALREADY_KNOWN_SUCCESS });
};
