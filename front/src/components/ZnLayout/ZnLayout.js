import React from 'react'
import PropTypes from 'prop-types'

import DialogHelp from '../Generic/DialogHelp'
import ZnLayoutLogin from './ZnLayoutLogin'
import ZnLayoutLogout from './ZnLayoutLogout'
import HelpLink from './HelpLink'
import Footer from './footer/Footer'

export const ZnLayout = ({
  activeMonth,
  activeDeclaration,
  isFilesServiceUp,
  children,
  user,
}) => {
  if (!user) {
    return (
      <ZnLayoutLogout>
        {children}
        <DialogHelp />
      </ZnLayoutLogout>
    );
  }

  return (
    <>
      <ZnLayoutLogin
        isFilesServiceUp={isFilesServiceUp}
        activeMonth={activeMonth}
        activeDeclaration={activeDeclaration}
        user={user}
      >
        {children}

        <DialogHelp />
        <HelpLink />
      </ZnLayoutLogin>
      <Footer />
    </>
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
