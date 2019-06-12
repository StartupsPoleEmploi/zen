import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'
import superagent from 'superagent'

import tester from '../../images/tester.png'

const StyledSignup = styled.div`
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

const StyleSeparator = styled.div`
  background-color: #0065db;
  border-radius: 2px;
  width: 4.5rem;
  height: 0.6rem;
`

const ClockImg = styled.img`
  margin-bottom: 2rem;
  height: 6rem;
`

const TesterImg = styled.img`
  display: block;
  width: 40rem;
  margin: 8rem auto 5rem auto;
`

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export class Signup extends Component {
  static propTypes = {
    user: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
      csrfToken: PropTypes.string,
    }),
  }

  state = {
    email: '',
    emailError: '',
    emailConfirmation: '',
    emailConfirmationError: '',
    isFinished: false,
    isError: false,
  }

  onChangeEmail = ({ target: { value: email } }) => this.setState({ email })

  onChangeEmailConfirmation = ({ target: { value: email } }) =>
    this.setState({ emailConfirmation: email })

  onSubmit = () => {
    if (!this.props.user.email && !EMAIL_REGEX.test(this.state.email)) {
      return this.setState({
        emailError: `Merci d'entrer une adresse e-mail valide`,
        emailConfirmationError: '',
      })
    }

    if (
      !this.props.user.email &&
      this.state.email.trim() !== this.state.emailConfirmation.trim()
    ) {
      return this.setState({
        emailError: '',
        emailConfirmationError: `Les deux adresses e-mails ne sont pas identiques`,
      })
    }

    superagent
      .patch('/api/user', {
        email: this.state.email,
      })
      .set('CSRF-Token', this.props.user.csrfToken)
      .then(() => this.setState({ isFinished: true }))
      .catch(() => this.setState({ isError: true }))
  }

  render() {
    const { user } = this.props
    const {
      isError,
      email,
      emailError,
      emailConfirmation,
      emailConfirmationError,
    } = this.state

    if (isError) {
      return (
        <StyledSignup>
          <LandingText>Erreur</LandingText>

          <Typography gutterBottom>
            Une erreur s'est produite lors de votre inscription. Merci de
            réessayer ultérieurement.
          </Typography>
        </StyledSignup>
      )
    }

    if (!user.email && !this.state.isFinished) {
      return (
        <StyledSignup>
          <TesterImg src={tester} alt="" />

          <LandingText variant="h5" component="h1">
            Merci pour votre demande d'inscription <br />
            au service Zen de Pôle Emploi
          </LandingText>

          <Typography paragraph>
            Pour confirmer votre demande d'inscription,
            <br />
            merci de renseigner l'email que vous utilisez
            <br />
            dans vos échanges avec Pôle Emploi
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
        </StyledSignup>
      )
    }

    return (
      <StyledSignup>
        <ClockImg src="noun-clock.svg" alt="" />
        <LandingText
          component="h1"
          style={{
            marginBottom: '5rem',
          }}
        >
          Votre demande d'inscription <br />
          est en cours d'enregistrement.
        </LandingText>

        <Typography paragraph style={{ marginBottom: '5rem' }}>
          <strong>
            Le service est en test uniquement dans les Hauts-de-France et en
            Occitanie
            <br />
            pour les{' '}
            <span aria-label="assistants et assistantes">
              assistant.e.s
            </span>{' '}
            maternelles.
          </strong>
        </Typography>

        <Typography paragraph variant="subtitle1">
          Merci de l'intérêt que vous portez à Zen.
        </Typography>

        <StyleSeparator />
      </StyledSignup>
    )
  }
}

export default Signup
