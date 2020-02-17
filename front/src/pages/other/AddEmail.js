import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'
import superagent from 'superagent'
import { hot } from 'react-hot-loader'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import { setEmail } from '../../redux/actions/user'
import catchMaintenance from '../../lib/catchMaintenance'

import tester from '../../images/tester.png'

const StyledAddEmail = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 50rem;
`

const LandingText = styled(Typography).attrs({
  variant: 'h6',
  paragraph: true,
})``

const Form = styled.form`
  display: flex;
  flex-direction: column;
  padding-top: 1rem;

  max-width: 35rem;
  width: 100%;
`

const StyledButton = styled(Button).attrs({
  color: 'primary',
  variant: 'raised',
})`
  && {
    margin-top: 2rem;
  }
`

const StyledTextField = styled(TextField)`
  && {
    margin-bottom: 1rem;

    label {
      width: 100%;
    }
  }
`

const TesterImg = styled.img`
  display: block;
  width: 40rem;
  margin: 8rem auto 5rem auto;
`

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export class AddEmail extends Component {
  static propTypes = {
    csrfToken: PropTypes.shape({}).isRequired,
    setEmail: PropTypes.func.isRequired,
  }

  state = {
    email: '',
    emailError: '',
    emailConfirmation: '',
    emailConfirmationError: '',
    isError: false,
  }

  onChangeEmail = ({ target: { value: email } }) => this.setState({ email })

  onChangeEmailConfirmation = ({ target: { value: email } }) =>
    this.setState({ emailConfirmation: email })

  onSubmit = () => {
    if (!EMAIL_REGEX.test(this.state.email)) {
      return this.setState({
        emailError: `Merci d'entrer une adresse e-mail valide`,
        emailConfirmationError: '',
      })
    }
    if (this.state.email.trim() !== this.state.emailConfirmation.trim()) {
      return this.setState({
        emailError: '',
        emailConfirmationError: `Les deux adresses e-mails ne sont pas identiques`,
      })
    }

    superagent
      .patch('/api/user', { email: this.state.email })
      .set('CSRF-Token', this.props.csrfToken)
      .then(() => {
        this.props.setEmail(this.state.email.trim())
        window.location.replace('/')
      })
      .catch(catchMaintenance)
      .catch(() => this.setState({ isError: true }))
  }

  render() {
    const {
      isError,
      email,
      emailError,
      emailConfirmation,
      emailConfirmationError,
    } = this.state

    if (isError) {
      return (
        <StyledAddEmail>
          <LandingText>Erreur</LandingText>

          <Typography gutterBottom>
            Une erreur s'est produite lors de votre inscription. Merci de
            réessayer ultérieurement.
          </Typography>
        </StyledAddEmail>
      )
    }

    return (
      <StyledAddEmail>
        <TesterImg src={tester} alt="" />

        <LandingText variant="h5" component="h1">
          Merci pour votre demande d'inscription <br />
          au service Zen de Pôle emploi
        </LandingText>

        <Typography paragraph>
          Pour confirmer votre demande d'inscription,
          <br />
          merci de renseigner l'email que vous utilisez
          <br />
          dans vos échanges avec Pôle emploi
        </Typography>

        <Form onSubmit={this.onSubmit}>
          <StyledTextField
            label="Tapez ici votre adresse e-mail"
            name="email"
            value={email}
            onChange={this.onChangeEmail}
            error={!!emailError}
            helperText={emailError}
            inputProps={{ type: 'email' }}
          />
          <StyledTextField
            label="Confirmez votre adresse e-mail"
            name="email-confirmation"
            value={emailConfirmation}
            onChange={this.onChangeEmailConfirmation}
            error={!!emailConfirmationError}
            helperText={emailConfirmationError}
            inputProps={{ type: 'email' }}
          />

          <StyledButton onClick={this.onSubmit}>Valider</StyledButton>
        </Form>
      </StyledAddEmail>
    )
  }
}

export default hot(module)(
  withRouter(
    connect(
      (state) => ({
        csrfToken: state.userReducer.user.csrfToken,
      }),
      { setEmail },
    )(AddEmail),
  ),
)
