import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import PropTypes from 'prop-types'

const PrivateRoute = ({ isLoggedIn, ...props }) =>
  isLoggedIn ? <Route {...props} /> : <Redirect to="/loggedOut" />

PrivateRoute.propTypes = { isLoggedIn: PropTypes.bool.isRequired }

export default PrivateRoute
