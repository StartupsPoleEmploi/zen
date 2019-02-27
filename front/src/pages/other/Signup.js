import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'
import superagent from 'superagent'

const StyledSignup = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 48rem;
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
  }
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
    isFinished: false,
    isError: false,
  }

  onChangeEmail = ({ target: { value: email } }) => this.setState({ email })

  onSubmit = () => {
    if (!this.props.user.email && !EMAIL_REGEX.test(this.state.email)) {
      return this.setState({
        emailError: `Merci d'entrer une adresse e-mail valide`,
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
    const { isError, emailError, email } = this.state

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
          <LandingText>Je souhaite m'inscrire au prochain test</LandingText>

          <Typography paragraph>Bonjour,</Typography>
          <Typography paragraph>
            Vous n’êtes pas encore inscrit sur la liste des testeurs de Zen.
          </Typography>
          <Typography paragraph>
            Merci de nous fournir votre e-mail, afin que nous puissions vous
            contacter pour un prochain test.
          </Typography>

          <Form onSubmit={this.onSubmit}>
            <StyledTextField
              label="Adresse e-mail"
              name="email"
              value={email}
              onChange={this.onChangeEmail}
              error={!!emailError}
              helperText={emailError}
              inputProps={{ type: 'email' }}
            />

            <StyledButton onClick={this.onSubmit}>Valider</StyledButton>
          </Form>
        </StyledSignup>
      )
    }

    return (
      <StyledSignup>
        <LandingText>Inscription terminée</LandingText>

        <Typography paragraph>Votre inscription à Zen est terminée.</Typography>
        <Typography paragraph>
          Nous vous contacterons prochainement pour un prochain test.
        </Typography>
        <Typography paragraph>
          Si vous souhaitez contacter l'équipe, vous pouvez envoyer un message à{' '}
          <a href="mailto:zen@pole-emploi.fr">zen@pole-emploi.fr</a>
        </Typography>
        <Typography paragraph>
          Merci de l'intérêt que vous portez à Zen.
        </Typography>
      </StyledSignup>
    )
  }
}

export default Signup
