import React from 'react'
import PropTypes from 'prop-types'
import { Typography } from '@material-ui/core'
import TooltipsDemo from '../../../components/Generic/TooltipsDemo'

const EMPLOYER_SLIDES = [
  {
    selector: '.employer-question:nth-child(1) .root-employer',
    content: (
      <Typography>
        Si vous avez plusieurs employeurs, cliquez sur "Ajouter un employeur"
      </Typography>
    ),
  },
  {
    selector: '.employer-question:nth-child(1) .root-work-hours',
    content: (
      <Typography>
        Indiquez les heures qui seront inscrites sur votre fiche de paie
      </Typography>
    ),
  },
  {
    selector: '.employer-question:nth-child(1)  .root-salary',
    content: (
      <Typography>Déclarez le salaire brut pour cet employeur</Typography>
    ),
  },
  {
    selector: '.employer-question:nth-child(1) .root-contract',
    content: (
      <Typography>
        Si votre employeur vous a payé des congés, n’oubliez pas d’inclure cette
        somme dans le salaire brut déclaré
      </Typography>
    ),
  },
]

function EmployerOnBoarding({ onFinish }) {
  return <TooltipsDemo slides={EMPLOYER_SLIDES} onFinish={onFinish} />
}

EmployerOnBoarding.propTypes = {
  onFinish: PropTypes.func.isRequired,
}

export default EmployerOnBoarding
