import Button from '@material-ui/core/Button'
import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import Check from '@material-ui/icons/Check'

import CustomDialog from '../Generic/CustomDialog'

const StyledArrowForwardIcon = styled(ArrowForwardIcon)`
  && {
    margin-left: 1rem;
  }
`
const CheckIcon = styled(Check)`
  && {
    margin-right: 1rem;
    color: green;
    vertical-align: sub;
  }
`

const DeclarationTransmitted = ({ isOpened, onCancel }) => (
  <CustomDialog
    content={
      <DialogContentText gutterBottom>
        Si vous êtes en possession de vos justificatifs, vous pouvez dès à
        présent les ajouter à votre dossier Zen.
      </DialogContentText>
    }
    title={
      <span>
        <CheckIcon />
        Votre actualisation a bien
        <br />
        été transmise à Pôle emploi !
      </span>
    }
    titleId="DeclarationTransmittedDialogTitle"
    isOpened={isOpened}
    onCancel={onCancel}
    actions={
      <Button variant="contained" onClick={onCancel} color="primary">
        Continuer
        <StyledArrowForwardIcon />
      </Button>
    }
  />
)

DeclarationTransmitted.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default DeclarationTransmitted
