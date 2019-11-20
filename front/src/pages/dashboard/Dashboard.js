import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import moment from 'moment'
import { connect } from 'react-redux'
import withWidth from '@material-ui/core/withWidth'
import { Typography } from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import { Link } from 'react-router-dom'

import { fetchDeclarations as fetchDeclarationAction } from '../../redux/actions/declarations'
import { formattedDeclarationMonth, formatIntervalDates } from '../../lib/date'
import {
  selectPreviewedEmployerDoc,
  selectPreviewedInfoDoc,
} from '../../selectors/declarations'
import {
  getMissingEmployerFiles,
  getDeclarationMissingFilesNb,
} from '../../lib/file'
import { primaryBlue, DOCUMENT_LABELS } from '../../constants'
import file from '../../images/files.svg'

import DeclarationFinished from './DeclarationFinished'
import DeclarationNotStarted from './DeclarationNotStarted'
import DeclarationClosed from './DeclarationClosed'
import DeclarationOnGoing from './DeclarationOnGoing'
import DeclarationImpossible from './DeclarationImpossible'
import MainActionButton from '../../components/Generic/MainActionButton'

const StyledDashboard = styled.div`
  margin: 0 auto;
  max-width: ${({ width }) => {
    if (width === 'xs') return '100%'
    if (['md', 'sm'].includes(width)) return '95%'
    return '85rem'
  }};
`

const Title = styled(Typography).attrs({ variant: 'h4', component: 'h1' })`
  && {
    margin-bottom: 2rem;
    font-weight: bold;
    letter-spacing: 1px;
    text-align: ${({ width }) =>
      ['xs', 'sm'].includes(width) ? 'center' : 'left'};
    margin-top: ${({ width }) =>
      ['xs', 'sm'].includes(width) ? '2rem' : '5rem'};
  }
`
const SubTitle = styled(Typography).attrs({ variant: 'h5', component: 'h2' })`
  && {
    display: inline-block;
    padding-bottom: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: solid 1px lightgray;
    font-size: 2rem;
    font-weight: bold;
    position: relative;
  }
`

const FileIcon = styled.img`
  margin-right: 1.5rem;
  font-size: 1.5rem;
  vertical-align: sub;
`

const StatusContainer = styled.div`
  display: ${({ width }) => (['xs', 'sm'].includes(width) ? 'block' : 'flex')};
`

const ActuStatus = styled.div`
  width: 90%;
  padding: 3rem 2rem 3rem 0;
  margin: ${({ width }) => (['xs', 'sm'].includes(width) ? 'auto' : null)};
  padding: ${({ width }) =>
    ['xs', 'sm'].includes(width) ? '3rem 2rem' : null};
  width: ${({ width }) => (['xs', 'sm'].includes(width) ? '100%' : null)};
`
const FileStatus = styled(ActuStatus)`
  && {
    padding: 3rem 2rem;
    background-color: #f7f7f7;
  }
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

const MonthName = styled(Typography).attrs({ component: 'h3' })`
  && {
    color: #1e2c59;
    text-transform: capitalize;
  }
`

const StyledDoneIcon = styled(DoneIcon)`
  && {
    margin-right: 1rem;
    vertical-align: bottom;
    color: green;
  }
`

const StyledArrowForwardIcon = styled(ArrowForwardIcon)`
  && {
    margin-left: 1rem;
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
  position: absolute;
  top: -8px;
  left: 5px;

  width: 2rem;
  height: 2rem;
  border-radius: 50%;

  background-color: #ff6237;
  color: #fff;

  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
`

class Dashboard extends PureComponent {
  static propTypes = {
    activeMonth: PropTypes.instanceOf(Date).isRequired,
    fetchDeclarations: PropTypes.func.isRequired,
    user: PropTypes.shape({
      firstName: PropTypes.string,
      hasAlreadySentDeclaration: PropTypes.bool,
      canSendDeclaration: PropTypes.bool,
    }),
    declaration: PropTypes.object,
    declarations: PropTypes.arrayOf(PropTypes.object),
    width: PropTypes.string.isRequired,
  }

  componentDidMount() {
    this.props.fetchDeclarations()
  }

  renderInfoFile = (info, index) => (
    <Typography
      key={`${index}-${info.type}`}
      style={{ fontWeight: 'bold' }}
      className="missing-info-file"
    >
      {DOCUMENT_LABELS[info.type]}{' '}
      <Lower>{formatIntervalDates(info.startDate, info.endDate)}</Lower>
    </Typography>
  )

  renderEmployerFile = ({ name, type }, index) => {
    const key = `${index}-${name}`

    return (
      <Typography
        key={key}
        style={{ fontWeight: 'bold' }}
        className="missing-employer-file"
      >
        <Upper>{name}</Upper> : {DOCUMENT_LABELS[type]}
      </Typography>
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
        {employerFilesMissing.map(this.renderEmployerFile)}
        {infoFilesMissing.map(this.renderInfoFile)}
      </RemainingFiles>
    )
  }

  renderActuStatus = () => {
    const {
      user,
      declarations: allDeclarations,
      declaration: activeDeclaration,
      activeMonth,
    } = this.props

    if (!activeMonth) {
      return <DeclarationClosed previousDeclaration={allDeclarations[0]} />
    }

    if (user.hasAlreadySentDeclaration) {
      return (
        <div>
          <Typography
            style={{ textTransform: 'uppercase', margin: '2rem 0 1.5rem 0' }}
          >
            <strong>
              <StyledDoneIcon /> Actualisation déjà envoyée via pole-emploi.fr
            </strong>
          </Typography>
        </div>
      )
    }

    if (activeMonth && !activeDeclaration && user.canSendDeclaration) {
      return <DeclarationNotStarted activeMonth={activeMonth} />
    }

    if (!user.canSendDeclaration) {
      return <DeclarationImpossible />
    }

    if (activeDeclaration.hasFinishedDeclaringEmployers) {
      return <DeclarationFinished declaration={activeDeclaration} />
    }

    if (activeDeclaration) {
      return (
        <DeclarationOnGoing
          declaration={activeDeclaration}
          activeMonth={this.props.activeMonth}
        />
      )
    }
  }

  getMissingFilesNb = () => {
    const { declarations: allDeclarations } = this.props

    const declarations = allDeclarations.filter(
      ({ hasFinishedDeclaringEmployers, isFinished }) =>
        hasFinishedDeclaringEmployers && !isFinished,
    )

    const [lastDeclaration] = declarations
    if (
      !lastDeclaration ||
      (lastDeclaration.isFinished && declarations.length === 0)
    ) {
      return 0
    }

    return declarations.reduce(
      (prev, decl) => prev + getDeclarationMissingFilesNb(decl),
      0,
    )
  }

  renderFilesSection() {
    const { declarations: allDeclarations } = this.props

    // Missing files list
    return (
      <div>
        {allDeclarations.map(this.renderMonthFileSection)}
        <MainActionButton
          to="/files"
          component={Link}
          style={{
            width: '90%',
            margin: '3rem auto 0 auto',
            fontSize: '1.6rem',
          }}
          primary
        >
          Gérer mes justificatifs
          <StyledArrowForwardIcon />
        </MainActionButton>
      </div>
    )
  }

  render() {
    const { user, width, activeMonth } = this.props

    const activeMonthMoment = activeMonth ? moment(activeMonth) : null

    const computeMissingFiles = this.getMissingFilesNb()

    return (
      <StyledDashboard width={width}>
        <Title width={width}>Bonjour {user.firstName}</Title>
        <StatusContainer width={width}>
          <ActuStatus width={width}>
            <SubTitle>
              Actualisation
              {activeMonthMoment && ' - '}
              {activeMonthMoment && (
                <Upper>{activeMonthMoment.format('MMMM YYYY')}</Upper>
              )}
            </SubTitle>
            {this.renderActuStatus()}
          </ActuStatus>
          <FileStatus width={width}>
            <SubTitle>
              <FileIcon src={file} alt="" />
              {computeMissingFiles !== 0 && (
                <StyledSup>{computeMissingFiles}</StyledSup>
              )}
              Justificatifs manquants sur Zen
            </SubTitle>

            {computeMissingFiles === 0 ? (
              <Typography>Vous n'avez pas de fichier à envoyer.</Typography>
            ) : (
              this.renderFilesSection()
            )}
          </FileStatus>
        </StatusContainer>
      </StyledDashboard>
    )
  }
}

export default connect(
  (state) => ({
    declarations: state.declarationsReducer.declarations,
    isLoading: state.declarationsReducer.isLoading,
    previewedEmployerDoc: selectPreviewedEmployerDoc(state),
    previewedInfoDoc: selectPreviewedInfoDoc(state),
    activeMonth: state.activeMonthReducer.activeMonth,
    user: state.userReducer.user,
  }),
  {
    fetchDeclarations: fetchDeclarationAction,
  },
)(withWidth()(Dashboard))
