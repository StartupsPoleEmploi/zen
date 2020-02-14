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
  FETCH_ACTIVE_DECLARATION_MONTHS_LOADING,
  FETCH_ACTIVE_DECLARATION_MONTHS_SUCCESS,
  FETCH_ACTIVE_DECLARATION_MONTHS_FAILURE,
} from '../actions/actionNames'

export default createReducer(
  {
    isLoading: false,
    declarationMonths: null,
  },
  {
    [FETCH_ACTIVE_DECLARATION_MONTHS_LOADING]: (state) => {
      state.isLoading = true
      state.declarationMonths = null
    },
    [FETCH_ACTIVE_DECLARATION_MONTHS_SUCCESS]: (state, { payload }) => {
      state.isLoading = false
      state.declarationMonths = payload
    },
    [FETCH_ACTIVE_DECLARATION_MONTHS_FAILURE]: (state, { payload }) => {
      state.isLoading = false
      state.declarationMonths = payload
    },
  },
)
