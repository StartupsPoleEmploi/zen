import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { connect } from 'react-redux'
import withWidth from '@material-ui/core/withWidth'
import { Typography } from '@material-ui/core'
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';

import { fetchDeclarations as fetchDeclarationAction } from '../../redux/actions/declarations'
import ActuStatus from '../../components/Generic/actu/ActuStatus'
import OnBoarding from './onBoarding/OnBoarding'
import DashboardJustificatifs from './DashboardJustificatifs'

const StyledDashboard =  styled.div`
  margin: ${({ width }) => {
    if (['xs', 'sm'].includes(width)) return '0rem 1rem !important'
    if (['md'].includes(width)) return '0rem 2rem !important'
    return '0rem 4rem !important'
  }};
`

const Title = styled(Typography).attrs({ variant: 'h3', component: 'h1' })`
  && {
    margin-bottom: 2rem;
    font-weight: bold;
    letter-spacing: 1px;
    text-align: left;
    margin-left: ${({ width }) =>
      ['xs', 'sm'].includes(width) ? '2rem' : null};
    margin-top: ${({ width }) =>
      ['xs', 'sm'].includes(width) ? '2rem' : '5rem'};
  }
`

const StatusContainer = styled.div``

class Dashboard extends PureComponent {
  componentDidMount() {
    this.props.fetchDeclarations()
  }

  render() {
    const { user, width, activeMonth, declarations, declaration } = this.props

    if (user.needOnBoarding) {
      // Show "thank you" to only relative new users
      return (
        <OnBoarding
          showEmail={!user.email}
          showThankYou={user.registeredAt > '2020-01-16'}
        />
      )
    }

    return (
      <StyledDashboard width={width}>
        <Grid container spacing={2}>
          <Grid item md={8} sm={12}>
            <Title>Bonjour {user.firstName}</Title>
            <StatusContainer>
              {!user.isBlocked && (
                <ActuStatus
                  activeMonth={activeMonth}
                  user={user}
                  declarations={declarations}
                  declaration={declaration}
                />
              )}
              <DashboardJustificatifs />
            </StatusContainer>
          </Grid>
          <Hidden only={['xs', 'sm']}>
            <Grid item xs={4}>
              <h1>Besoin d'aide</h1>
            </Grid>
          </Hidden>
        </Grid>
      </StyledDashboard>
    )
  }
}

Dashboard.propTypes = {
  activeMonth: PropTypes.instanceOf(Date).isRequired,
  fetchDeclarations: PropTypes.func.isRequired,
  user: PropTypes.shape({
    firstName: PropTypes.string,
    hasAlreadySentDeclaration: PropTypes.bool,
    canSendDeclaration: PropTypes.bool,
    isBlocked: PropTypes.bool,
    email: PropTypes.string,
    needOnBoarding: PropTypes.bool,
    registeredAt: PropTypes.instanceOf(Date),
  }),
  declaration: PropTypes.object,
  declarations: PropTypes.arrayOf(PropTypes.object),
  width: PropTypes.string.isRequired,
}

export default connect(
  (state) => ({
    declarations: state.declarationsReducer.declarations,
    activeMonth: state.activeMonthReducer.activeMonth,
    user: state.userReducer.user,
    isFilesServiceUp: state.statusReducer.isFilesServiceUp,
  }),
  {
    fetchDeclarations: fetchDeclarationAction,
  },
)(withWidth()(Dashboard))
