import DialogContentText from '@material-ui/core/DialogContentText'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import Check from '@material-ui/icons/Check'

import CustomDialog from '../Generic/CustomDialog'
import { mobileBreakpoint } from '../../constants'
import MainActionButton from '../Generic/MainActionButton'

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

// These br are not active on mobile
const NotMobileBR = styled.br`
  @media (max-width: ${mobileBreakpoint}) {
    display: none;
  }
`

const DeclarationTransmitted = ({ isOpened, onCancel }) => (
  <CustomDialog
    width="xl"
    content={
      <DialogContentText gutterBottom style={{ color: 'black' }}>
        Si vous êtes en possession de vos justificatifs, vous pouvez dès à
        présent les ajouter à votre dossier Zen.
      </DialogContentText>
    }
    title={
      <span>
        <CheckIcon />
        Votre actualisation a bien
        <NotMobileBR />
        été transmise à Pôle emploi !
      </span>
    }
    titleId="DeclarationTransmittedDialogTitle"
    isOpened={isOpened}
    onCancel={onCancel}
    actions={
      <MainActionButton
        primary
        variant="contained"
        onClick={onCancel}
        color="primary"
      >
        Continuer
        <StyledArrowForwardIcon />
      </MainActionButton>
    }
  />
)

DeclarationTransmitted.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default DeclarationTransmitted
