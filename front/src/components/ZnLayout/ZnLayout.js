import React from 'react'
import PropTypes from 'prop-types'

import ZnLayoutLogin from './ZnLayoutLogin'
import ZnLayoutLogout from './ZnLayoutLogout'
import HelpLink from './HelpLink'

export const ZnLayout = ({
  activeMonth,
  activeDeclaration,
  isFilesServiceUp,
  children,
  user,
}) => {
  if (!user) {
    return <ZnLayoutLogout>{children}</ZnLayoutLogout>
  }

  return (
    <ZnLayoutLogin
      isFilesServiceUp={isFilesServiceUp}
      activeMonth={activeMonth}
      activeDeclaration={activeDeclaration}
      user={user}
    >
      {children}

      <HelpLink />
    </ZnLayoutLogin>
  )
}

ZnLayout.propTypes = {
  children: PropTypes.node,
  user: PropTypes.shape({
    firstName: PropTypes.string,
  }),
  isFilesServiceUp: PropTypes.bool,
  activeMonth: PropTypes.instanceOf(Date),
  activeDeclaration: PropTypes.object,
}

export default ZnLayout
