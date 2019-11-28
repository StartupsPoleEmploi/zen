import PropTypes from 'prop-types'
import React from 'react'

import ZnLayoutLogin from './ZnLayoutLogin'
import ZnLayoutLogout from './ZnLayoutLogout'

export const ZnLayout = ({
  activeMonth,
  activeDeclaration,
  children,
  user,
}) => {
  if (!user) {
    return <ZnLayoutLogout>{children}</ZnLayoutLogout>
  }

  return (
    <ZnLayoutLogin
      activeMonth={activeMonth}
      activeDeclaration={activeDeclaration}
      user={user}
    >
      {children}
    </ZnLayoutLogin>
  )
}

ZnLayout.propTypes = {
  children: PropTypes.node,
  user: PropTypes.shape({
    firstName: PropTypes.string,
  }),
  activeMonth: PropTypes.instanceOf(Date),
  activeDeclaration: PropTypes.object,
}

export default ZnLayout
