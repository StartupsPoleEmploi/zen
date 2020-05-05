/* eslint-disable no-param-reassign */

import { createReducer } from '@reduxjs/toolkit'


const helpPopupReducer = createReducer(
  { isOpen: false },
  {
    'HELP_POPUP_VISIBLE': (state) => {
      state.isOpen = true;
    },
    'HELP_POPUP_HIDE': (state) => {
      state.isOpen = false;
    },
  },
)

export default helpPopupReducer
