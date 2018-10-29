import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import styled from 'styled-components'

import CustomColorButton from '../Generic/CustomColorButton'

const StyledDialogContent = styled(DialogContent)`
  && {
    text-align: center;
  }
`

const StyledDialogTitle = styled(DialogTitle)`
  text-align: center;
`

const StyledDialogActions = styled(DialogActions)`
  && {
    justify-content: space-around;
    padding-bottom: 2rem;
  }
`

class DeclarationDialog extends Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    isOpened: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    consistencyErrors: PropTypes.arrayOf(PropTypes.string).isRequired,
    validationErrors: PropTypes.arrayOf(PropTypes.string).isRequired,
  }

  confirm = () => this.props.onConfirm()

  confirmAndIgnoreErrors = () => this.props.onConfirm({ ignoreErrors: true })

  render() {
    const {
      isLoading,
      isOpened,
      consistencyErrors,
      validationErrors,
      onCancel,
    } = this.props

    return (
      <Dialog
        open={isOpened}
        onClose={onCancel}
        /* if loading, prevent from leaving modal */
        disableEscapeKeyDown={isLoading}
        disableBackdropClick={isLoading}
        aria-labelledby="ActuDialogContentText"
      >
        <StyledDialogTitle>Envoi de l'actualisation</StyledDialogTitle>
        {isLoading ? (
          <StyledDialogContent>
            <CircularProgress />
            <DialogContentText id="ActuDialogContentText">
              Envoi en cours…
            </DialogContentText>
          </StyledDialogContent>
        ) : validationErrors.length > 0 ? (
          <Fragment>
            <StyledDialogContent>
              <DialogContentText id="ActuDialogContentText">
                Notre système a détecté des erreurs dans votre déclaration
                <ul>
                  <Fragment>
                    {validationErrors.map((error) => <li>{error}</li>)}
                  </Fragment>
                </ul>
                Zen n'est pas en mesure de prendre en charge votre déclaration.
                Veuillez la modifier, ou l'effectuer sur Pole-Emploi.fr
              </DialogContentText>
            </StyledDialogContent>
            <StyledDialogActions>
              <CustomColorButton color="primary" onClick={onCancel}>
                Je modifie ma déclaration
              </CustomColorButton>
              <Button
                variant="raised"
                href="https://www.pole-emploi.fr"
                target="_self"
                color="primary"
              >
                J'accède à Pole-Emploi.fr
              </Button>
            </StyledDialogActions>
          </Fragment>
        ) : consistencyErrors.length > 0 ? (
          <Fragment>
            <StyledDialogContent>
              <DialogContentText id="ActuDialogContentText">
                Notre système a détecté de possibles incohérences : Vous avez
                déclaré
                <ul>
                  <Fragment>
                    {consistencyErrors.map((error) => <li>{error}</li>)}
                  </Fragment>
                </ul>
                Confirmez-vous ces informations ?
              </DialogContentText>
            </StyledDialogContent>
            <StyledDialogActions>
              <CustomColorButton onClick={onCancel}>
                Je modifie ma déclaration
              </CustomColorButton>
              <Button
                variant="raised"
                onClick={this.confirmAndIgnoreErrors}
                color="primary"
                autoFocus
              >
                Je valide cette déclaration
              </Button>
            </StyledDialogActions>
          </Fragment>
        ) : (
          <Fragment>
            <StyledDialogContent>
              <DialogContentText id="ActuDialogContentText">
                Votre actualisation va être envoyée à Pôle-Emploi.
                <br />
                Nous vous envoyons un e-mail pour vous le confirmer.
              </DialogContentText>
            </StyledDialogContent>
            <StyledDialogActions>
              <CustomColorButton onClick={onCancel}>
                Je n'ai pas terminé
              </CustomColorButton>
              <Button
                variant="raised"
                onClick={this.confirm}
                color="primary"
                autoFocus
              >
                Je m'actualise
              </Button>
            </StyledDialogActions>
          </Fragment>
        )}
      </Dialog>
    )
  }
}

export default DeclarationDialog
