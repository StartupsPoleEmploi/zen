import React from 'react'
import { Typography } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

import { ActuStatusBlock } from './ActuGenericComponent'

const DeclarationImpossible = () => (
  <ActuStatusBlock title="Actualisation impossible" Icon={<CloseIcon style={{color: "red"}}/>}>
    <Typography style={{ marginTop: '2rem' }}>
      Un problème technique nous empêche actuellement de récupérer les
      informations de votre statut de demandeur d'emploi.
    </Typography>
    <Typography style={{ marginTop: '2rem' }}>
      Vous pouvez réessayer ultérieurement ou effectuer vos opérations sur{' '}
      <a href="https://www.pole-emploi.fr" style={{ whiteSpace: 'nowrap' }}>
        pole-emploi.fr
      </a>
      .
    </Typography>
  </ActuStatusBlock>
)

export default DeclarationImpossible
