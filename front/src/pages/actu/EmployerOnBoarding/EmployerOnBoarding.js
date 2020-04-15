import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import TooltipsDemo from '../../../components/Generic/TooltipsDemo';

const EMPLOYER_SLIDES = [
  {
    selector: '.employer-question:nth-child(1) .root-employer',
    content: (
      <Typography>
        Indiquez les heures qui seront inscrites sur votre fiche de paie
      </Typography>
    ),
  },
  {
    selector: '.employer-question:nth-child(1) .root-work-hours',
    content: (
      <Typography>
        Si vous avez une fiche de paie, inscrivez le nombre d'heures qui y figure. Si vous
        {' '}
        déclarez être en activité partielle, vous devez déclarer un minimum de 1h travaillée.
      </Typography>
    ),
  },
  {
    selector: '.employer-question:nth-child(1)  .root-salary',
    content: (
      <Typography>Déclarez la rémunération pour cet employeur</Typography>
    ),
  },
  {
    selector: '.employer-question:nth-child(1) .root-contract',
    content: (
      <Typography>
        Si votre employeur vous a payé des congés, n’oubliez pas d’inclure cette
        somme dans la rémunération déclarée
      </Typography>
    ),
  },
];

function EmployerOnBoarding({ onFinish }) {
  return <TooltipsDemo slides={EMPLOYER_SLIDES} onFinish={onFinish} />;
}

EmployerOnBoarding.propTypes = {
  onFinish: PropTypes.func.isRequired,
};

export default EmployerOnBoarding;
