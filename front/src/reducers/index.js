import { combineReducers } from 'redux'
import declarationsReducer from './declarations'
import userReducer from './user'

export default combineReducers({
  declarationsReducer,
  userReducer,
})
