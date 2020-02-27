import DialogContentText from '@material-ui/core/DialogContentText'
import AlarmOn from '@material-ui/icons/AlarmOn'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import styled from 'styled-components'
import ArrowRightAlt from '@material-ui/icons/ArrowRightAlt'

import CustomDialog from '../Generic/CustomDialog'
import MainActionButton from '../Generic/MainActionButton'

const StyledArrowRightAlt = styled(ArrowRightAlt)`
  margin-left: 1rem;
`

const AlarmOnIcon = styled(AlarmOn)`
  && {
    width: 4rem;
    height: 4rem;
  }
`

// Custom code so we get a modal with a white transparent background
// without box-shadow, aligned with the top of the page
const StyledCustomDialog = styled(CustomDialog)`
  & > div[class^='MuiDialog-container'] {
    align-items: flex-start;
  }
  div[class^='MuiDialogContent-root'] {
    flex: inherit;
  }
`

const PreviousEmployersDialog = ({ employers = [], isOpened, onCancel }) => (
  <StyledCustomDialog
    content={
      <Fragment>
        <ul
          style={{
            padding: '1.5rem',
            paddingBottom: '2rem',
            marginTop: 0,
            listStylePosition: 'inside',
          }}
        >
          {employers.map((employer) => (
            <DialogContentText
              component="li"
              key={employer.id}
              style={{
                display: 'list-item',
                textTransform: 'uppercase',
                color: '#000',
              }}
            >
              <b>{employer.employerName}</b>
            </DialogContentText>
          ))}
        </ul>
        <DialogContentText style={{ color: '#000', paddingBottom: '1rem' }}>
          Vous allez pouvoir supprimer vos employeurs pré-remplis ou ajouter de
          nouveaux employeurs pour le mois en cours.
        </DialogContentText>
      </Fragment>
    }
    title={
      <Fragment>
        <AlarmOnIcon color="primary" />
        <br />
        <br />
        Nous avons pré-rempli votre page employeurs avec ceux renseignés lors de
        votre actualisation précédente&nbsp;:
      </Fragment>
    }
    titleId="PreviousEmployersDialogContentText"
    isOpened={isOpened}
    onCancel={onCancel}
    actions={
      <MainActionButton onClick={onCancel} variant="contained" color="primary">
        J'ai compris
        <StyledArrowRightAlt />
      </MainActionButton>
    }
    disableEscapeKeyDown
    disableBackdropClick
  />
)

PreviousEmployersDialog.propTypes = {
  employers: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number, employerName: PropTypes.string }),
  ),
  isOpened: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default PreviousEmployersDialog
