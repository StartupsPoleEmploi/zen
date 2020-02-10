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
import { createReducer } from '@reduxjs/toolkit'

import {
  FETCH_USER_LOADING,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILURE,
  SET_USER_LOGGED_OUT,
} from '../actions/actionNames'

export default createReducer(
  {
    isLoading: false,
    user: null,
    err: null,
  },
  {
    [FETCH_USER_LOADING]: (state) => {
      state.isLoading = true
      state.user = null
    },
    [FETCH_USER_SUCCESS]: (state, { payload }) => {
      state.isLoading = false
      state.user = payload
    },
    [FETCH_USER_FAILURE]: (state, { payload }) => {
      state.isLoading = false
      state.err = payload
    },
    [SET_USER_LOGGED_OUT]: (state) => {
      if (!state.user) return
      state.user.isLoggedOut = true
    },
    SET_EMAIL: (state, { payload }) => {
      state.user.email = payload.email
    },
    SET_NO_NEED_ON_BOARDING: (state) => {
      state.user.needOnBoarding = false
    },
    SET_NO_NEED_EMPLOYER_ON_BOARDING: (state) => {
      state.user.needEmployerOnBoarding = false
    },
  },
)
