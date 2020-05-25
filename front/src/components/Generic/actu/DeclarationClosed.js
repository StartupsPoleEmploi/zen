import React from 'react'
import PropTypes from 'prop-types'
import { Typography } from '@material-ui/core'
import moment from 'moment'

import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import { ActuStatusBlock } from './ActuGenericComponent'

const DeclarationClosed = ({ dateActuNextMonth }) => (
  <ActuStatusBlock title="Pas encore ouverte" Icon={<CloseOutlinedIcon style={{color: "gray"}}/>}>
    {dateActuNextMonth && (
      <Typography>
        Vous pourrez vous actualiser à partir du{' '}
        <strong>{moment(dateActuNextMonth).format('DD MMMM YYYY')}</strong>
      </Typography>
    )}
  </ActuStatusBlock>
)

DeclarationClosed.propTypes = {
  dateActuNextMonth: PropTypes.shape({}),
}

export default DeclarationClosed
