import { combineReducers } from 'redux'
import declarationsReducer from './declarations'
import declarationMonthsReducer from './declarationMonths'
import userReducer from './user'
import statusReducer from './status'
import activeMonthReducer from './activeMonth'

export default combineReducers({
  declarationsReducer,
  declarationMonthsReducer,
  userReducer,
  statusReducer,
  activeMonthReducer,
})
