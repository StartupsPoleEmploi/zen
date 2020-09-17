/* eslint-disable no-param-reassign */
/*
 * Reducers with @reduxjs/toolkit use immer to allow us to describe in an imperative
 * way state changes, which is way faster and easier to write, read and understand than
 * writing usual reducers.
 *
 * Nothing is mutated here, refer to immer library to know how it works
 * (note: this description of immer here is useful because it is not an explicit
 * dependency of this project, as it is bundled in @reduxjs/toolkit)
 */
import { createReducer } from '@reduxjs/toolkit';

import {
  SHOW_SNACKBAR_UPLOAD_SUCCESS,
  HIDE_SNACKBAR_UPLOAD_SUCCESS,
} from '../actions/actionNames';

export default createReducer(
  {
    showSnackbarUploadSuccess: false,
  },
  {
    [SHOW_SNACKBAR_UPLOAD_SUCCESS]: (state) => {
      state.showSnackbarUploadSuccess = true;
    },
    [HIDE_SNACKBAR_UPLOAD_SUCCESS]: (state) => {
      state.showSnackbarUploadSuccess = false;
    },
  },
);
