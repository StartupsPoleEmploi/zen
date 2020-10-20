// @flow

import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  Card, Button, notification, Icon, Modal,
} from 'antd';
import superagent from 'superagent';

import { URLS } from '../../../common/routes';
import { useUseradmin } from '../../../common/contexts/useradminCtx';
import { useUsers } from '../../../common/contexts/usersCtx';
import { getAgenceName } from '../../../common/agencesInfos';
import IconBoolean from '../../../components/IconBoolean';

const LABELS = {
  firstName: 'Prenom',
  lastName: 'Nom',
  email: 'E-mail',
  createdAt: 'Créer le',
  updatedAt: 'Modifié le',
  postalCode: 'Code postal',
  gender: 'Sexe',
  isAuthorized: 'Autorisé',
  registeredAt: 'Enregistré à',
  isBlocked: 'Radié',
  agencyCode: 'Code agence',
  situationRegardEmploiId: 'Situation regard emploi',
  isActuDone: 'ActuFait (PeDump)',
  isSubscribedEmail: 'Souscrit au e-mail',
};

type Props = {
  user: Object,
}

export default function UserInfos({ user }: Props) {
  const history = useHistory();
  const { fetchUsers } = useUsers();
  const { logoutIfNeed, isAdmin } = useUseradmin();
  const data = {
    ...user,
    isAuthorized: <IconBoolean val={user.isAuthorized} />,
    isBlocked: <IconBoolean val={user.isBlocked} />,
    isActuDone: <IconBoolean val={user.isActuDone} />,
    agencyCode: getAgenceName(user.agencyCode),
    isSubscribedEmail: <IconBoolean val={user.isSubscribedEmail} />,
  };
  const iconsKeys = ['isAuthorized', 'isBlocked', 'isActuDone', 'isSubscribedEmail'];

  const removeUser = () => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      content: 'Tous ses informations vont être supprimées ( actualisations, employés, fichiers, activités, ...) et ne pourront pas être récuperées.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      async onOk() {
        await superagent
          .delete(`/zen-admin-api/delete-user/${user.id}`)
          .then(() => {
            notification.success({ message: "L'utilisateur a bien été supprimé" });
            history.replace(URLS.USERS.BASE);
            fetchUsers();
          })
          .catch(logoutIfNeed)
          .catch((err) => {
            notification.error({ message: err });
          });
      },
    });
  };

  return (
    <Card
      title="Information"
      style={{ marginBottom: '20px' }}
      extra={isAdmin() ? (
        <Button type="danger" onClick={removeUser}>
          <Icon type="delete" style={{ color: 'white' }} />
        </Button>
      ) : null}
    >
      <table border="1">
        <tbody>
          {Object.entries(data)
            .filter(([key, val]) => iconsKeys.includes(key) || (typeof val !== 'object' && !Array.isArray(val)))
            .map(([key, val]) => (
              <tr key={key}>
                <td>
                  <b>{`${LABELS[key] || key}: `}</b>
                </td>
                <td>{val}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </Card>
  );
}
