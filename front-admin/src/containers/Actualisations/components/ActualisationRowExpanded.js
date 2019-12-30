import React, { useState } from 'react';
import moment from 'moment';
import superagent from 'superagent';
import {
  Button,
  notification,
  Checkbox,
  Input,
  Form,
} from 'antd';

function calculateTotal(employers, field) {
  const sum = employers.reduce(
    (prev, employer) => parseFloat(employer[field]) + prev,
    0,
  );
  return Math.round(sum);
}

const statuses = [
  {
    field: 'internship',
    boolField: 'hasInternship',
    label: 'a été en stage',
  },
  {
    field: 'sickLeave',
    boolField: 'hasSickLeave',
    label: 'a été en congé maladie',
  },
  {
    field: 'maternityLeave',
    boolField: 'hasMaternityLeave',
    label: 'a été en congé maternité',
  },
  {
    field: 'retirement',
    boolField: 'hasRetirement',
    label: 'est en retraite',
  },
  {
    field: 'invalidity',
    boolField: 'hasInvalidity',
    label: 'est invalide',
  },
  {
    field: 'jobSearch',
    boolField: 'isLookingForJob',
    label: 'a arrêté de chercher du travail',
  },
];


type PropsUser = {
  firstName: string,
  lastName: string,
  email: string,
};

type Props = {
  id: string,
  user: PropsUser,
  hasFinishedDeclaringEmployers: bool,
  isFinished: bool,
  employers: Array<Object>,
  infos: Array<Object>,
  review: Object,
  isLookingForJob: bool,
};


/*
 * Note : This component makes too much requests and should not be used as a model
 * (the declaration sent as props is never updated, which is a bad design,
 * but quick and ok for this admin's temporary interface)
 */
export default function ActualisationRowExpanded(declaration: Props) {
  const [isVerified, setIsVerified] = useState(
    (declaration.review && declaration.review.isVerified) || false,
  );
  const [notes, setNotes] = useState(
    (declaration.review && declaration.review.notes) || '',
  );

  function onSubmit() {
    superagent
      .post('/zen-admin-api/declarations/review', {
        notes,
        isVerified,
        declarationId: declaration.id,
      })
      .then(() => {
        notification.success({
          message: 'La modification a bien été prise en compte',
        });
      })
      .catch(() => {
        notification.error({
          message: "Erreur d'enregistrement",
          description: "Une erreur s'est produite en mettant à jour les données, merci d'actualiser (si ceci se reproduit, contacter le développeur)",
        });
      });
  }

  return (
    <div>
      <h3>
        {declaration.user.firstName}
        {' '}
        {declaration.user.lastName}
      </h3>
      <p>
        {declaration.infos
          .sort((a, b) => (a.type > b.type ? 1 : -1))
          .map((info) => {
            const formatDates = ({ startDate, endDate }) => (startDate && endDate
              ? `du ${moment(startDate).format('DD/MM')} au ${moment(endDate).format('DD/MM')}`
              : `à partir du ${moment(startDate || endDate).format('DD/MM')}`);

            const status = statuses.find(({ field }) => field === info.type);

            // Used to filter data in case something happened and some dates were saved
            // without the correct field set up.
            if (
              (!declaration[status.boolField]
                && status.boolField !== 'isLookingForJob')
              || (declaration[status.boolField]
                && status.boolField === 'isLookingForJob')
            ) {
              return null;
            }

            return `${status.label} ${formatDates(info)}`;
          })
          .filter((a) => a)
          .join(', ')}
      </p>
      <p>
        Souhaite rester inscrit à Pôle emploi:
        {' '}
        {declaration.isLookingForJob ? 'Oui' : 'Non'}
      </p>
      <p>Employeurs:</p>
      <ul>
        <>
          {declaration.employers.map((employer) => (
            <li key={employer.id}>
              {employer.employerName}
              {' '}
              {employer.workHours}
h
              {' '}
              {employer.salary}
€ -
              Contrat
              {' '}
              {employer.hasEndedThisMonth ? 'terminé' : ' non terminé'}
            </li>
          ))}
        </>
      </ul>
      <p>
        Total:
        {' '}
        {calculateTotal(declaration.employers, 'workHours')}
h,
        {' '}
        {calculateTotal(declaration.employers, 'salary')}
€
      </p>
      <p>
        <a href={`/zen-admin-api/declarations/${declaration.id}/files`}>
          Télécharger les fichiers (
          {declaration.isFinished ? 'validées' : 'non validés'}
)
        </a>
      </p>
      <div style={{ backgroundColor: '#fff', padding: '12px' }}>
        <Checkbox
          onChange={(e) => setIsVerified(e.target.checked)}
          checked={isVerified}
        >
          Vérifié
        </Checkbox>
        <Form.Item label="Notes">
          <Input.TextArea
            rows="3"
            placeholder="Notes"
            onChange={(e) => setNotes(e.target.value)}
            value={notes}
          />
        </Form.Item>

        <Button onClick={onSubmit} type="primary">
          Valider
        </Button>
      </div>
    </div>
  );
}
