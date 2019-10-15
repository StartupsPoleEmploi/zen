import React, { Component } from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import ArrowRightAlt from '@material-ui/icons/ArrowRightAlt'
import MainActionButton from '../Generic/MainActionButton'

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

const StyledArrowRightAlt = styled(ArrowRightAlt)`
  margin-left: 1rem;
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
        <Typography variant="body1">
          Si vous êtes créateur / créatrice d'entreprise ou auto-entrepreneur,
          vous ne pouvez pas effectuer votre actualisation sur Zen.
        </Typography>
        <ButtonsContainer style={{ paddingTop: '3rem' }}>
          <MainActionButton primary onClick={this.showDeclarationForm}>
            J'ai compris
            <StyledArrowRightAlt />
          </MainActionButton>
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
