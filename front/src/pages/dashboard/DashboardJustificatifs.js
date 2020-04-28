import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { connect } from 'react-redux'
import withWidth from '@material-ui/core/withWidth'
import { Typography, Grid, Hidden } from '@material-ui/core'
import { Link } from 'react-router-dom'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';

import { formattedDeclarationMonth, formatIntervalDates } from '../../lib/date'
import { getMissingEmployerFiles, getMissingFilesNb } from '../../lib/file'
import { primaryBlue, DOCUMENT_LABELS, darkBlue } from '../../constants'

import DashbordMainBt from '../../components/Generic/DashbordMainBt'
import StatusFilesError from '../../components/Actu/StatusFilesError'
import OnBoarding from './onBoarding/OnBoarding'


const StyledPriorityIcon = styled(PriorityHighIcon)`
  && {
    margin-right: 1rem;
    display: inline-block;
    vertical-align: bottom;
    color: #ff6237;
  }
`

const SubTitle = styled(Typography).attrs({ variant: 'h5', component: 'h2' })`
  && {
    display: flex;
    padding: 2rem;
    margin-bottom: 2rem;
    font-size: 2rem;
    font-weight: bold;
    position: relative;
    background-color: #f7f7f7;
    text-transform: uppercase;
    align-items: center;
  }
`

const ContainerFile = styled.div`
  padding: 2rem;
`

const Opacity = styled.div`
  opacity: ${({ isFilesServiceUp }) => (isFilesServiceUp ? 1 : 0.4)};
`

const Upper = styled.span`
  text-transform: uppercase;
`
const Lower = styled.span`
  text-transform: lowercase;
`

const RemainingFiles = styled.div`
  border-left: solid 1px #d4e2f3;
  padding-left: 3rem;
  position: relative;
`

const ErrorContainer = styled.div`
  border-top: solid 1px #ff622a;
  padding-top: 2rem;
  margin-top: 3rem;
`

const MonthName = styled(Typography).attrs({ component: 'h3' })`
  && {
    color: ${darkBlue};
    text-transform: capitalize;
  }
`

const Dot = styled.span`
  color: ${primaryBlue};
  font-family: serif;
  font-size: 3.5rem;
  font-weight: bold;

  position: absolute;
  left: -6px;
  top: -20px;
`

const StyledSup = styled.sup`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  margin-left: 1rem;

  background-color: #ff6237;
  color: #fff;

  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
`

class DashboardJustificatifs extends PureComponent {

  renderButton = () => {
    const { isFilesServiceUp } = this.props
    return (
      <DashbordMainBt
        to="/files"
        component={Link}
        disabled={!isFilesServiceUp}
        style={{ width: '90%', margin: '3rem auto 0 auto' }}
      >
        Gérer mes justificatifs
      </DashbordMainBt>
    )
  }

  renderMonthFileSection = (declaration) => {
    if (declaration.isFinished) return null

    const employerFilesMissing = getMissingEmployerFiles(declaration)
    const infoFilesMissing = declaration.infos.filter((f) => !f.isTransmitted)
    const formattedMonth = formattedDeclarationMonth(
      declaration.declarationMonth.month,
    )

    if (employerFilesMissing.length + infoFilesMissing.length === 0) {
      return null
    }

    return (
      <RemainingFiles key={declaration.id}>
        <Dot>.</Dot>
        <MonthName>{formattedMonth}</MonthName>

        {employerFilesMissing.map(({ name, type, employerId }) => (
          <Typography
            key={`${employerId}-${name}`}
            style={{ fontWeight: 'bold' }}
            className="missing-employer-file"
          >
            <Upper>{name}</Upper> : {DOCUMENT_LABELS[type]}
          </Typography>
        ))}

        {infoFilesMissing.map((info) => (
          <Typography
            key={`${info.employerId}-${info.type}`}
            style={{ fontWeight: 'bold' }}
            className="missing-info-file"
          >
            {DOCUMENT_LABELS[info.type]}{' '}
            <Lower>{formatIntervalDates(info.startDate, info.endDate)}</Lower>
          </Typography>
        ))}
      </RemainingFiles>
    )
  }

  renderFilesSection(computeMissingFiles) {
    if (computeMissingFiles === 0 ) {
      return <Typography>Vous n'avez pas de fichier à envoyer.</Typography>
    }

    const { declarations: allDeclarations } = this.props
    const onGoingDeclarations = allDeclarations.filter(
      ({ hasFinishedDeclaringEmployers, isFinished }) =>
        hasFinishedDeclaringEmployers && !isFinished,
    )
    // Missing files list
    return (
      <Grid container spacing={4}>
        <Grid items lg={7} md={12} >
          <div style={{ display: 'flex', margin: '2rem 0 1.5rem 0' }}>
            <StyledPriorityIcon />
            <div>
              <Typography style={{width: '90%'}}>
                Vous avez un ou des justificatifs manquants. Mettez à jour dès à présent votre
                {' '}
                dossier Zen Pôle emploi pour éviter <b>un risque de trop-perçu.</b>
              </Typography>
              <Hidden mdDown>
                {this.renderButton()}
               </Hidden>
            </div>
          </div>
        </Grid>
        <Grid items lg={5} md={12}>
          {onGoingDeclarations.map(this.renderMonthFileSection)}
        </Grid>
        <Hidden lgUp>
            {this.renderButton()}
        </Hidden>
      </Grid>
    )
  }

  render() {
    const { user, width, isFilesServiceUp, declarations } = this.props
    const computeMissingFiles = getMissingFilesNb(declarations)

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
      <div width={width}>
        <SubTitle>
          Justificatif(s) manquant(s)
          {computeMissingFiles !== 0 && (<StyledSup>{computeMissingFiles}</StyledSup>)}
        </SubTitle>

        <ContainerFile width={width}>
          <Opacity isFilesServiceUp={isFilesServiceUp}>
            {this.renderFilesSection(computeMissingFiles)}
          </Opacity>
          {!isFilesServiceUp && (
            <ErrorContainer>
              <StatusFilesError hideDashboardLink />
            </ErrorContainer>
          )}
        </ContainerFile>
      </div>
    )
  }
}

DashboardJustificatifs.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string,
    hasAlreadySentDeclaration: PropTypes.bool,
    canSendDeclaration: PropTypes.bool,
    isBlocked: PropTypes.bool,
    email: PropTypes.string,
    needOnBoarding: PropTypes.bool,
    registeredAt: PropTypes.instanceOf(Date),
  }),
  isFilesServiceUp: PropTypes.bool,
  declarations: PropTypes.arrayOf(PropTypes.object),
  width: PropTypes.string.isRequired,
}

export default connect(
  (state) => ({
    declarations: state.declarationsReducer.declarations,
    user: state.userReducer.user,
    isFilesServiceUp: state.statusReducer.isFilesServiceUp,
  }),
  {
  },
)(withWidth()(DashboardJustificatifs))
