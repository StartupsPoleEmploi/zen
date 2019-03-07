import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

const StyledUserJobCheck = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: 5rem;
`

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  flex: 1;
  flex-wrap: wrap;
  padding: 1rem 0 1.5rem;
  max-width: 32rem;
  width: 100%;
`

const StyledButton = styled(Button).attrs({
  color: 'primary',
  size: 'large',
  variant: 'outlined',
})`
  && {
    color: #000;
    max-width: 100%;
    width: 10rem;
  }
`

const StyledTypography = styled(Typography).attrs({
  variant: 'subtitle1',
  component: 'p',
})`
  && {
    line-height: 2.5rem;
    margin-bottom: 2.5rem;
  }
`

export class UserJobCheck extends Component {
  static propTypes = { onValidate: PropTypes.func.isRequired }

  constructor(props) {
    super(props)

    this.state = { showUnavailableMessage: false }
  }

  onInvalid = () => this.setState({ showUnavailableMessage: true })

  render() {
    return (
      <StyledUserJobCheck>
        <StyledTypography>
          <b>
            Avant de commencer votre actualisation,
            <br />
            veuillez répondre à cette question.
          </b>
        </StyledTypography>
        <StyledTypography>
          Êtes-vous créateur / créatrice d'entreprise ?
        </StyledTypography>
        <ButtonsContainer>
          <StyledButton onClick={this.props.onValidate}>Oui</StyledButton>
          <StyledButton onClick={this.onInvalid}>Non</StyledButton>
        </ButtonsContainer>
        {this.state.showUnavailableMessage && (
          <Typography variant="body2">
            Nous sommes désolés, mais ce service n'est pas adapté à votre usage.
            <br />
            Merci d'effectuer votre actualisation sur{' '}
            <a href="https://www.pole-emploi.fr" rel="noopener noreferrer">
              pole-emploi.fr
            </a>
          </Typography>
        )}
      </StyledUserJobCheck>
    )
  }
}

export default UserJobCheck
