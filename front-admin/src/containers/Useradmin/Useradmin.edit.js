// @flow

import React, { useState, useEffect } from 'react';
import superagent from 'superagent';
import { notification } from 'antd';
import { useHistory } from 'react-router-dom';

import { useUseradmin } from '../../common/contexts/useradminCtx';
import { URLS } from '../../common/routes';
import ZnContent from '../../components/ZnContent';
import ZnHeader from '../../components/ZnHeader';
import UseradminForm from './components/UseradminForm';

async function updateUseradmin(id, data) {
  return superagent
    .post(`/zen-admin-api/useradmins/${id}/update`, data);
}


type Props = {
  match: Object,
}
export default function UseradminEdit({ match }: Props) {
  const history = useHistory();
  const [useradmin, setUseradmin] = useState(null);
  const { logoutIfNeed } = useUseradmin();
  const { id: useradminId } = match.params;

  useEffect(() => {
    superagent
      .get(`/zen-admin-api/useradmins/${useradminId}`)
      .then(({ body }) => setUseradmin(body))
      .catch(logoutIfNeed);
  }, [logoutIfNeed, useradminId]);


  const onSubmit = (values) => {
    updateUseradmin(useradminId, values).then(() => {
      notification.success({ message: 'Modification bien prise en compte' });
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
      <ZnHeader title={`Utilisateurs ${useradminId}`} />
      <ZnContent>
        {useradmin ? (
          <UseradminForm onSubmit={onSubmit} mode="edit" useradmin={useradmin} />
        )
          : <h3 style={{ textAlign: 'center', margin: '20px' }}>Loading ...</h3>}
      </ZnContent>
    </div>
  );
}
