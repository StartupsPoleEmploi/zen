import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import moment from 'moment'

import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'

const Container = styled.div`
  display: flex;
  margin: 2rem 0 1.5rem 0;
`

const StyledCloseIcon = styled(CloseOutlinedIcon)`
  && {
    margin-right: 1rem;
    display: inline-block;
    vertical-align: bottom;
    color: gray;
  }
`

const DeclarationClosed = ({ dateActuNextMonth }) => (
    <div>
      <Container>
        <StyledCloseIcon />
        <div>
          <Typography
            className="declaration-status"
            style={{ textTransform: 'uppercase', marginBottom: '1rem' }}
          >
            <strong>Pas encore ouverte</strong>
          </Typography>

          {dateActuNextMonth && (
            <Typography>
              Vous pourrez vous actualiser à partir du{' '}
              <strong>{moment(dateActuNextMonth).format('DD MMMM YYYY')}</strong>
            </Typography>
          )}
        </div>
      </Container>
    </div>
  )

DeclarationClosed.propTypes = {
  dateActuNextMonth: PropTypes.shape({}),
}

export default DeclarationClosed
