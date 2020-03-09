import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import { Link } from 'react-router-dom'

import MainActionButton from '../MainActionButton'
import CircleJauge from '../../../pages/dashboard/CircleJauge'
import { darkBlue } from '../../../constants'

const FlexContainer = styled.div`
  display: flex;
`

const JaugeContainer = styled.div`
  margin-right: 2.5rem;
`

const StyledArrowForwardIcon = styled(ArrowForwardIcon)`
  && {
    margin-left: 1rem;
  }
`

const DeclarationOnGoing = ({ declaration }) => (
  <div>
    <Typography
      className="declaration-status"
      style={{ textTransform: 'uppercase', margin: '2rem 0 1.5rem 0' }}
    >
      <strong>Actualisation en cours</strong>
    </Typography>

    <FlexContainer>
      <JaugeContainer>
        <CircleJauge style={{ marginRight: '2.5rem' }} percentage={50} />
      </JaugeContainer>

      <div>
        <Typography style={{ textTransform: 'uppercase', color: darkBlue }}>
          Avancement de l'actualisation
        </Typography>
        <Typography>
          À terminer avant le{' '}
          <strong>
            {moment(declaration.declarationMonth.endDate).format(
              'DD MMMM YYYY',
            )}
          </strong>
        </Typography>
      </div>
    </FlexContainer>

    <MainActionButton
      to={declaration.hasFinishedDeclaringEmployers ? '/files' : '/employers'}
      component={Link}
      title="Continuez votre actualisation"
      style={{
        width: '90%',
        margin: '2rem auto 0 auto',
      }}
      primary
    >
      Continuer l'actualisation
      <StyledArrowForwardIcon />
    </MainActionButton>
  </div>
)

DeclarationOnGoing.propTypes = {
  declaration: PropTypes.object.isRequired,
}

export default DeclarationOnGoing
