import { Button } from '@material-ui/core'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Warning from '@material-ui/icons/Warning'
import React, { Component } from 'react'
import { withRouter } from 'react-router'
import styled from 'styled-components'
import superagent from 'superagent'

import { EmployerDocumentUpload } from '../../components/Actu/EmployerDocumentUpload'

const StyledFiles = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 55rem;
  margin: auto;
`

const StyledTitle = styled(Typography)`
  && {
    margin-bottom: 1rem;
  }
`

const StyledSummary = styled.div`
  display: flex;
  justify-content: space-between;
  border: 1px solid #d7d7d7;
  border-radius: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background-color: #fbfbfb;
  margin-bottom: 1rem;
`

const StyledSummaryTypography = styled(Typography)`
  flex: 1 1 33%;
`

const StyledInfo = styled.div`
  display: flex;
  align-items: center;
`

const StyledInfoTypography = styled(Typography)`
  padding-left: 0.5rem;
`

const StyledList = styled(List)`
  && {
    margin-bottom: 1rem;
    width: 100%;
  }
`

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
`

const calculateTotal = (employers, field) => {
  const total = employers.reduce(
    (total, employer) => parseInt(employer[field], 10) + total,
    0,
  )
  return isNaN(total) || total === 0 ? '—' : total.toString()
}

export class Files extends Component {
  static propTypes = {}

  state = {
    employers: [],
  }

  constructor(props) {
    super(props)

    superagent
      .get('/api/employers')
      .then((res) => res.body)
      .then((employers) => this.setState({ employers }))
  }

  submitFile = ({ file, employerId }) => {
    this.setState({
      employers: this.state.employers.map(
        (employer) =>
          employer.id === employerId
            ? { ...employer, isLoading: true }
            : employer,
      ),
    })
    superagent
      .post('/api/employers/files')
      .field('employerId', employerId)
      .attach('employerFile', file)
      .then((res) => res.body)
      .then((updatedEmployer) =>
        this.setState({
          employers: this.state.employers.map(
            (employer) =>
              employer.id === updatedEmployer.id ? updatedEmployer : employer,
          ),
        }),
      )
      .catch(() =>
        this.setState({
          employers: this.state.employers.map(
            (employer) =>
              employer.id === employerId
                ? {
                    ...employer,
                    isLoading: false,
                    error: `Désolé, une erreur s'est produite, Merci de réessayer ultérieurement`,
                  }
                : employer,
          ),
        }),
      )
  }

  renderEmployerRow = (employer) => (
    <EmployerDocumentUpload {...employer} submitFile={this.submitFile} />
  )

  render() {
    const { employers } = this.state

    const remainingDocuments = employers.reduce(
      (prev, employer) => prev + (employer.file ? 0 : 1),
      0,
    )

    return (
      <StyledFiles>
        <StyledTitle variant="title">
          Envoi des documents du mois de Mai 2018
        </StyledTitle>
        <StyledSummary>
          <StyledSummaryTypography variant="body2">
            <b>Actualisation du moi de mai</b>
          </StyledSummaryTypography>
          <StyledSummaryTypography
            variant="body2"
            style={{ textAlign: 'center' }}
          >
            Heures déclarées : {calculateTotal(employers, 'workHours')}h
          </StyledSummaryTypography>
          <StyledSummaryTypography
            variant="body2"
            style={{ textAlign: 'right' }}
          >
            Salaire brut : {calculateTotal(employers, 'salary')}€
          </StyledSummaryTypography>
        </StyledSummary>

        <StyledInfo>
          {remainingDocuments > 0 && <Warning />}
          <StyledInfoTypography variant="body2">
            {remainingDocuments > 0
              ? `Reste ${remainingDocuments} documents à fournir`
              : 'Les documents sont prêts à être envoyés'}
          </StyledInfoTypography>
        </StyledInfo>
        <StyledList>{employers.map(this.renderEmployerRow)}</StyledList>

        <ButtonsContainer>
          <Button variant="raised" disabled>
            Enregistrer et finir plus tard
          </Button>
          <Button variant="raised" onClick={this.onSubmit}>
            Envoyer à Pôle Emploi
          </Button>
        </ButtonsContainer>
      </StyledFiles>
    )
  }
}

export default withRouter(Files)
