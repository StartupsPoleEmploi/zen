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
    width: 15rem;
    margin-top: 2rem;
  }
`

// activate this if we decide we want to display the checkbox again
const ACTIVATE_CHECKBOX_DISPLAY = false

export class UserJobCheck extends Component {
  static propTypes = { onValidate: PropTypes.func.isRequired }

  state = {
    shouldAskAgain: true,
  }

  showDeclarationForm = () =>
    this.props.onValidate({
      shouldAskAgain: this.state.shouldAskAgain,
    })

  toggleCheckbox = () =>
    this.setState((prevState) => ({
      shouldAskAgain: !prevState.shouldAskAgain,
    }))

  render() {
    return (
      <StyledUserJobCheck>
        <Typography variant="body2">
          Si vous êtes créateur d'entreprise, vous ne pouvez pas faire votre
          actualisation sur Zen.
          <br />
          Merci d'effectuer votre actualisation sur{' '}
          <a href="https://www.pole-emploi.fr" rel="noopener noreferrer">
            pole-emploi.fr
          </a>
        </Typography>
        <ButtonsContainer>
          <StyledButton onClick={this.showDeclarationForm}>
            J'ai compris
          </StyledButton>
        </ButtonsContainer>

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
