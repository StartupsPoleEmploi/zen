import { combineReducers } from 'redux';
import declarationsReducer from './declarations';
import declarationMonthsReducer from './declarationMonths';
import userReducer from './user';
import statusReducer from './status';
import activeMonthReducer from './activeMonth';
import helpPopup from './helpPopup';
import thanksReducer from './thanks';

export default combineReducers({
  declarationsReducer,
  declarationMonthsReducer,
  userReducer,
  statusReducer,
  activeMonthReducer,
  helpPopup,
  thanksReducer,
});
