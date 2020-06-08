// @flow

import React from 'react';
import superagent from 'superagent';
import { notification } from 'antd';
import { useHistory } from 'react-router-dom';

import { useUseradmin } from '../../common/contexts/useradminCtx';
import { URLS } from '../../common/routes';
import ZnContent from '../../components/ZnContent';
import ZnHeader from '../../components/ZnHeader';
import UseradminForm from './components/UseradminForm';

async function putUseradmin(data) {
  return superagent
    .post('/zen-admin-api/useradmins/add', data);
}


export default function UseradminAdd() {
  const history = useHistory();
  const { logoutIfNeed } = useUseradmin();

  const onSubmit = (values) => {
    putUseradmin(values).then(() => {
      notification.success({ message: 'Utilisateur admin bien ajouter' });
      history.push(URLS.USERADMINS.BASE);
    })
      .catch(logoutIfNeed)
      .catch((err) => {
        if (err.status < 500 && err.response.text) {
          notification.error({ message: err.response.text });
        } else {
          notification.error({ message: 'Une erreur est survenue' });
        }
      });
  };

  return (
    <div>
      <ZnHeader title="Utilisateurs admin / AJOUT" />
      <ZnContent>
        <UseradminForm onSubmit={onSubmit} mode="add" />
      </ZnContent>
    </div>
  );
}
