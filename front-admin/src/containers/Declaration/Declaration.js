import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import superagent from 'superagent';
import moment from 'moment';
import {
  Button,
  notification,
  Checkbox,
  Input,
  Form,
  Card,
  Icon,
} from 'antd';


import ZnContent from '../../components/ZnContent';
import { URLS } from '../../common/routes';
import ZnHeader from '../../components/ZnHeader';
import DeclarationDetails from './components/DeclarationDetails';
import DeclarationInfos from './components/DeclarationInfos';
import DeclarationEmployers from './components/DeclarationEmployers';

async function getDeclaration(id) {
  return superagent
    .get(`/zen-admin-api/declarations/${id}`)
    .then(({ body }) => body);
}

async function updateDeclaration({ id, notes, isVerified }) {
  return superagent
    .post('/zen-admin-api/declarations/review', {
      notes,
      isVerified,
      declarationId: id,
    });
}

type Props = {
  match: Object,
};

export default function Declaration({ match }: Props) {
  const { id } = match.params;
  const [declaration, setDeclaration] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    getDeclaration(id).then((data) => setDeclaration(data));
  }, [id]);

  useEffect(() => {
    setIsVerified(!!(declaration && declaration.review && declaration.review.isVerified));
    setNotes((declaration && declaration.review && declaration.review.notes) || '');
  }, [declaration]);


  function onSubmit() {
    updateDeclaration({ notes, isVerified, id })
      .then(() => {
        notification.success({ message: 'La modification a bien été prise en compte' });
        getDeclaration(id).then((data) => setDeclaration(data));
      })
      .catch(() => {
        notification.error({
          message: "Erreur d'enregistrement",
          description: "Une erreur s'est produite en mettant à jour les données, merci d'actualiser (si ceci se reproduit, contacter le développeur)",
        });
      });
  }

  if (!declaration) return <p>Loading...</p>;

  const { user, isFinished } = declaration;
  const monthStr = moment(declaration.declarationMonth.month).format('MMMM');
  return (
    <>
      <ZnHeader title={`Declarations ${id}`} />
      <ZnContent>
        {declaration ? (
          <div>
            <h2>
              {`Déclaration de ${monthStr} de `}
              <Link to={`${URLS.USERS.view(user.id)}`}>
                {`${user.firstName} ${user.lastName}`}
              </Link>
              {' '}
              {declaration.isFinished
                ? <Icon type="check" style={{ color: 'green' }} />
                : <Icon type="close" style={{ color: 'red' }} />}
              <Button
                style={{ float: 'right' }}
                type="primary"
                href={`/zen-admin-api/declarations/${declaration.id}/files`}
              >
                <Icon type="download" />
                {' '}
                {`fichiers ${!isFinished ? 'non' : ''} validées`}
              </Button>
            </h2>
            <DeclarationDetails declaration={declaration} />
            <DeclarationInfos declaration={declaration} />
            <DeclarationEmployers declaration={declaration} />

            <Card title="Modification" style={{ marginBottom: '20px' }}>
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
            </Card>
          </div>
        )
          : <h3 style={{ textAlign: 'center', margin: '20px' }}>Loading ...</h3>}

      </ZnContent>
    </>
  );
}
