import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
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

// activate this if we decide we want to display the checkbox again
const ACTIVATE_CHECKBOX_DISPLAY = false

export class UserJobCheck extends Component {
  static propTypes = { onValidate: PropTypes.func.isRequired }

  state = {
    showUnavailableMessage: false,
    shouldAskAgain: true,
  }

  onInvalid = () => this.setState({ showUnavailableMessage: true })

  onValidate = () =>
    this.props.onValidate({ shouldAskAgain: this.state.shouldAskAgain })

  toggleCheckbox = () =>
    this.setState({ shouldAskAgain: !this.state.shouldAskAgain })

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
          <StyledButton onClick={this.onInvalid}>Oui</StyledButton>
          <StyledButton onClick={this.onValidate}>Non</StyledButton>
        </ButtonsContainer>
        {this.state.showUnavailableMessage && (
          <Typography variant="body2">
            Si vous êtes créateur d'entreprise, vous ne pouvez pas faire votre
            actualisation sur Zen.
            <br />
            Merci d'effectuer votre actualisation sur{' '}
            <a href="https://www.pole-emploi.fr" rel="noopener noreferrer">
              pole-emploi.fr
            </a>
          </Typography>
        )}
        {ACTIVATE_CHECKBOX_DISPLAY && (
          <FormControlLabel
            control={
              <Checkbox
                checked={!this.state.shouldAskAgain}
                onChange={this.toggleCheckbox}
                color="primary"
              />
            }
            label="Ne plus afficher cette question"
            style={{ marginTop: '5rem' }}
          />
        )}
      </StyledUserJobCheck>
    )
  }
}

export default UserJobCheck
