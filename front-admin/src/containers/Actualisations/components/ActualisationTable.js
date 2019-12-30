/* eslint-disable react/jsx-props-no-spreading */
// @flow
import React from 'react';
import moment from 'moment';

import ZnTable from '../../../components/ZnTable';
import ActualisationRowExpanded from './ActualisationRowExpanded';

type Props = {
  declarations: Array<Object>,
};


export default class ActualisationTable extends React.PureComponent<Props> {
  getStatus = (declaration) => {
    if (declaration.hasFinishedDeclaringEmployers) {
      if (declaration.isFinished) {
        return 'Actu et documents envoyés';
      }
      return 'Actu envoyée';
    }
    return 'Actu non terminée';
  };

  render() {
    const { declarations = [] } = this.props;
    const data = declarations.map((declaration) => ({
      ...declaration,
      name: `${declaration.user.firstName} ${declaration.user.lastName}`,
      email: declaration.user.email,
      status: this.getStatus(declaration),
      transmittedAt:
        declaration.transmittedAt
        && moment(declaration.transmittedAt).format('DD/MM/YYYY'),
      verified:
        declaration.review && declaration.review.isVerified ? 'oui' : 'non',
      notes: (declaration.review && declaration.review.notes) || '',
    }));

    const columns = [
      {
        title: 'Id',
        dataIndex: 'id',
        key: 'id',
        ellipsis: true,
        znSort: 'number',
        znSearchable: true,
      },
      {
        title: 'Nom',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        znSort: 'string',
        znSearchable: true,
      },
      {
        title: 'E-mail',
        dataIndex: 'email',
        key: 'email',
        ellipsis: true,
        znSort: 'string',
        znSearchable: true,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        ellipsis: true,
        znSort: 'string',
        znSearchable: true,
      },
      {
        title: 'Transmis le',
        dataIndex: 'transmittedAt',
        key: 'transmittedAt',
        ellipsis: true,
        znSort: 'string',
        znSearchable: true,
      },
      {
        title: 'Notes',
        dataIndex: 'notes',
        key: 'notes',
        ellipsis: true,
        znSort: 'string',
        znSearchable: true,
      },
    ];

    return (
      <ZnTable
        rowKey="id"
        size="small"
        style={{ backgroundColor: 'white' }}
        columns={columns}
        dataSource={data}
        expandedRowRender={(record) => <ActualisationRowExpanded {...record} />}
      />
    );
  }
}
