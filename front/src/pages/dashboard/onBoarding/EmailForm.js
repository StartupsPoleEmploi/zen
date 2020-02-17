import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import styled from 'styled-components'
import superagent from 'superagent'
import { hot } from 'react-hot-loader'
import { connect } from 'react-redux'

import { setEmail } from '../../../redux/actions/user'
import MainActionButton from '../../../components/Generic/MainActionButton'
import catchMaintenance from '../../../lib/catchMaintenance'

const StyledEmailForm = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  margin-bottom: 6rem;
`

const LandingText = styled(Typography).attrs({
  variant: 'h6',
  paragraph: true,
})``

const Form = styled.form`
  display: flex;
  flex-direction: column;
  padding-top: 1rem;

  width: 100%;
`

const FieldsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  text-align: left;
`

const StyledTextField = styled(TextField)`
  && {
    margin-bottom: 1rem;
    width: 35%;

    label {
      width: 100%;
    }
  }
`

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export class EmailForm extends PureComponent {
  static propTypes = {
    csrfToken: PropTypes.string.isRequired,
  }

  state = {
    email: '',
    emailError: '',
    emailConfirmation: '',
    emailConfirmationError: '',
    isError: false,
    isSuccess: false,
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
        this.setState({ isSuccess: true, isError: false })
        setEmail(this.state.email.trim())
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
      isSuccess,
    } = this.state

    if (isSuccess) {
      return (
        <StyledEmailForm>
          <Typography role="status" gutterBottom>
            Votre adresse e-mail a été enregistrée avec succès.
          </Typography>
        </StyledEmailForm>
      )
    }
    if (isError) {
      return (
        <StyledEmailForm>
          <LandingText>Erreur</LandingText>

          <Typography gutterBottom>
            Une erreur s'est produite lors de votre inscription. Merci de
            réessayer ultérieurement.
          </Typography>
        </StyledEmailForm>
      )
    }

    return (
      <StyledEmailForm>
        <Typography paragraph>
          Pour confirmer votre demande d'inscription, merci de renseigner
          l'email
          <br />
          que vous utilisez dans vos échanges avec Pôle emploi
        </Typography>

        <Form onSubmit={this.onSubmit}>
          <FieldsContainer>
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
          </FieldsContainer>
          <div>
            <MainActionButton
              primary
              style={{ marginTop: '3rem' }}
              onClick={this.onSubmit}
            >
              Valider
            </MainActionButton>
          </div>
        </Form>
      </StyledEmailForm>
    )
  }
}

export default hot(module)(
  connect((state) => ({
    csrfToken: state.userReducer.user.csrfToken,
  }))(EmailForm),
)
