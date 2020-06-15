export const openHelpPopup = () => (dispatch) => {
  dispatch({ type: 'HELP_POPUP_VISIBLE' });
};

export const hideHelpPopup = () => (dispatch) => {
  dispatch({ type: 'HELP_POPUP_HIDE' });
};
