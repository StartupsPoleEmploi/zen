import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'

import ActuButton from './ActuButton'
import CircleJauge from '../../../pages/dashboard/CircleJauge'
import { darkBlue } from '../../../constants'

const FlexContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
`

const JaugeContainer = styled.div`
  margin-right: 2.5rem;
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

    <ActuButton
      to={declaration.hasFinishedDeclaringEmployers ? '/files' : '/employers'}
      component={Link}
      title="Continuez votre actualisation"
    >
      Continuer l'actualisation
    </ActuButton>
  </div>
)

DeclarationOnGoing.propTypes = {
  declaration: PropTypes.object.isRequired,
}

export default DeclarationOnGoing
