import { combineReducers } from 'redux'
import declarationsReducer from './declarations'
import userReducer from './user'
import statusReducer from './status'
import activeMonthReducer from './activeMonth'

export default combineReducers({
  declarationsReducer,
  userReducer,
  statusReducer,
  activeMonthReducer,
})
