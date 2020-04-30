import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import styled from 'styled-components'
import { Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import TimelapseIcon from '@material-ui/icons/Timelapse'

import ActuButton from './ActuButton'
import CircleJauge from '../../../pages/dashboard/CircleJauge'
import { ActuStatusBlock } from './ActuGenericComponent'

const FlexContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
`

const JaugeContainer = styled.div`
  margin-right: 2.5rem;
  margin-left: 2rem;
`

const DeclarationOnGoing = ({ declaration }) => (
  <div>
    <FlexContainer>
      <ActuStatusBlock title="Actualisation en cours" Icon={<TimelapseIcon style={{color: "gray"}}/>}>
        <Typography>
          À terminer avant le{' '}
          <strong>
            {moment(declaration.declarationMonth.endDate).format(
              'DD MMMM YYYY',
            )}
          </strong>
        </Typography>
      </ActuStatusBlock>
      <JaugeContainer>
        <CircleJauge style={{ marginRight: '2.5rem' }} percentage={50} />
      </JaugeContainer>
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
