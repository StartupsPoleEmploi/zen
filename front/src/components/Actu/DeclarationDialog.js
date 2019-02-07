import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'

import CustomColorButton from '../Generic/CustomColorButton'
import CustomDialog from '../Generic/CustomDialog'

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

    const defaultProps = {
      title: "Envoi de l'actualisation",
      titleId: 'ActuDialogContentText',
      isOpened,
      onCancel,
    }

    if (isLoading) {
      return (
        <CustomDialog
          content={
            <Fragment>
              <CircularProgress />
              <DialogContentText>Envoi en cours…</DialogContentText>
            </Fragment>
          }
          disableEscapeKeyDown
          disableBackdropClick
          {...defaultProps}
        />
      )
    }

    if (validationErrors.length > 0) {
      return (
        <CustomDialog
          content={
            <Fragment>
              <DialogContentText>
                Notre système a détecté des erreurs dans votre déclaration :
              </DialogContentText>
              <ul style={{ padding: 0 }}>
                {validationErrors.map((error) => (
                  <DialogContentText component="li" key={error}>
                    {error}
                  </DialogContentText>
                ))}
              </ul>
              <DialogContentText>
                Zen n'est pas en mesure de prendre en charge votre déclaration.
                Veuillez la modifier, ou l'effectuer sur Pole-Emploi.fr
              </DialogContentText>
            </Fragment>
          }
          actions={
            <Fragment>
              <CustomColorButton color="primary" onClick={onCancel}>
                Je modifie ma déclaration
              </CustomColorButton>
              <Button
                variant="contained"
                href="https://www.pole-emploi.fr"
                target="_self"
                color="primary"
              >
                J'accède à Pole-Emploi.fr
              </Button>
            </Fragment>
          }
          {...defaultProps}
        />
      )
    }

    if (consistencyErrors.length > 0) {
      return (
        <CustomDialog
          content={
            <Fragment>
              <DialogContentText>
                Notre système a détecté de possibles incohérences dans votre
                actualisation{' '}:
              </DialogContentText>
              <ul style={{ padding: 0 }}>
                <Fragment>
                  {consistencyErrors.map((error) => (
                    <DialogContentText component="li" key={error}>
                      {error}
                    </DialogContentText>
                  ))}
                </Fragment>
              </ul>
              <DialogContentText>
                Confirmez-vous ces informations ?
              </DialogContentText>
            </Fragment>
          }
          actions={
            <Fragment>
              <CustomColorButton onClick={onCancel}>
                Je modifie ma déclaration
              </CustomColorButton>
              <Button
                variant="contained"
                onClick={this.confirmAndIgnoreErrors}
                color="primary"
                autoFocus
              >
                Je valide cette déclaration
              </Button>
            </Fragment>
          }
          {...defaultProps}
        />
      )
    }

    return (
      <CustomDialog
        content={
          <DialogContentText id="ActuDialogContentText">
            Votre actualisation va être envoyée à Pôle-Emploi.
            <br />
            Nous vous envoyons un e-mail pour vous le confirmer.
          </DialogContentText>
        }
        actions={
          <Fragment>
            <CustomColorButton onClick={onCancel}>
              Je n'ai pas terminé
            </CustomColorButton>
            <Button
              variant="contained"
              onClick={this.confirm}
              color="primary"
              autoFocus
            >
              Je m'actualise
            </Button>
          </Fragment>
        }
        {...defaultProps}
      />
    )
  }
}

export default DeclarationDialog
