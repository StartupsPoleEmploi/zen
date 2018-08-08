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

const LandingText = styled(Typography).attrs({ variant: 'title' })`
  padding: 8rem 0 2rem;
`

const TextContainer = styled.div`
  padding-top: 2rem;
  padding-bottom: 2rem;
`

const Form = styled.form`
  padding-top: 1rem;
`

const StyledButton = styled(Button).attrs({
  color: 'primary',
  variant: 'raised',
})`
  && {
    margin-top: 2rem;
  }
`

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export class Signup extends Component {
  static propTypes = {
    user: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
    }),
  }

  state = {
    peCode: '',
    peCodeError: '',
    email: '',
    emailError: '',
    isFinished: false,
    isError: false,
  }

  onChangePeCode = ({ target: { value: peCode } }) => this.setState({ peCode })
  onChangeEmail = ({ target: { value: email } }) => this.setState({ email })

  onSubmit = () => {
    let hasDetectedError = false
    if (!this.state.peCode) {
      this.setState({ peCodeError: `Merci d'entrer votre identifiant` })
      hasDetectedError = true
    }
    if (!this.props.user.email && !EMAIL_REGEX.test(this.state.email)) {
      this.setState({ emailError: `Merci d'entrer une adresse e-mail valide` })
      hasDetectedError = true
    }

    if (hasDetectedError) return

    superagent
      .patch('/api/user', {
        email: this.state.email,
        peCode: this.state.peCode,
      })
      .then(() => this.setState({ isFinished: true }))
      .catch(() => this.setState({ isError: true }))
  }

  render() {
    const { user } = this.props
    const {
      isFinished,
      isError,
      peCodeError,
      peCode,
      emailError,
      email,
    } = this.state

    if (user.isWaitingForConfirmation) {
      return (
        <StyledSignup>
          <LandingText>
            Votre inscription au prochain test est en cours de validation
          </LandingText>

          <TextContainer>
            <Typography gutterBottom>
              Si vous souhaitez contacter l'équipe, vous pouvez envoyer un
              message à{' '}
              <a href="mailto:zen@pole-emploi.fr">zen@pole-emploi.fr</a>
            </Typography>
          </TextContainer>
        </StyledSignup>
      )
    }

    if (isError) {
      return (
        <StyledSignup>
          <LandingText>Erreur</LandingText>

          <TextContainer>
            <Typography gutterBottom>
              Une erreur s'est produite lors de votre inscription. Merci de
              réessayer ultérieurement.
            </Typography>
          </TextContainer>
        </StyledSignup>
      )
    }

    if (isFinished) {
      return (
        <StyledSignup>
          <LandingText>Inscription terminée</LandingText>

          <TextContainer>
            <Typography gutterBottom>
              Votre inscription est terminée.
            </Typography>
            <Typography gutterBottom>
              Nous vous contacterons prochainement pour un prochain test.
            </Typography>
            <Typography gutterBottom>
              Merci de l'intérêt que vous portez à Zen.
            </Typography>
          </TextContainer>
        </StyledSignup>
      )
    }

    return (
      <StyledSignup>
        <LandingText>Je souhaite m'inscrire au prochain test</LandingText>

        <TextContainer>
          <Typography gutterBottom>Bonjour,</Typography>
          <Typography gutterBottom>
            Vous n’êtes pas encore inscrit sur la liste des testeurs de Zen.
          </Typography>
          <Typography gutterBottom>
            Merci de nous fournir les informations ci-dessous, et l’équipe de
            Zen vous contactera dès qu’une place sera disponible pour vous
            permettre de tester cette nouvelle façon de s’actualiser.
          </Typography>
        </TextContainer>

        <Form onSubmit={this.onSubmit}>
          <TextField
            label="Quel est votre identifiant Pôle Emploi ?"
            name="peCode"
            value={peCode}
            onChange={this.onChangePeCode}
            error={!!peCodeError}
            helperText={peCodeError}
            fullWidth
          />

          {!user.email && (
            <TextField
              label="Quelle est votre adresse e-mail ?"
              name="email"
              value={email}
              onChange={this.onChangeEmail}
              error={!!emailError}
              helperText={emailError}
              inputProps={{ type: 'email' }}
              fullWidth
            />
          )}

          <StyledButton onClick={this.onSubmit}>Valider</StyledButton>
        </Form>
      </StyledSignup>
    )
  }
}

export default Signup
