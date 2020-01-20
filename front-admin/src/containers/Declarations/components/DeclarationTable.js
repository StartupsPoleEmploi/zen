/* eslint-disable react/jsx-props-no-spreading */
// @flow
import React from 'react';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { Button, Icon } from 'antd';

import ZnTable from '../../../components/ZnTable';
import { URLS } from '../../../common/routes';


type Props = {
  declarations: Array<Object>,
  history: Object,
};
class DeclarationTable extends React.PureComponent<Props> {
  constructor(props) {
    super(props);
    const { history } = this.props;
    this.COLUMNS = [
      { title: 'Id', dataIndex: 'id', znSort: 'number' },
      { title: 'Nom', dataIndex: 'name' },
      { title: 'E-mail', dataIndex: 'email' },
      {
        title: 'Status',
        dataIndex: 'status',
        znSearchable: null,
        filters: [
          { text: 'Actu et documents envoyés', value: 'Actu et documents envoyés' },
          { text: 'Actu envoyée', value: 'Actu envoyée' },
          { text: 'Actu non terminée', value: 'Actu non terminée' },
        ],
        onFilter: (value, record) => record.status === value,
      },
      { title: 'Transmis le', dataIndex: 'transmittedAt' },
      { title: 'Notes', dataIndex: 'notes' },
      {
        title: 'Action',
        dataIndex: 'operation',
        fixed: 'right',
        width: 100,
        znSort: false,
        znSearchable: false,
        render: (text, record) => (
          <Button onClick={() => history.push(URLS.DECLARATIONS.view(record.id))} target="_blank">
            <Icon type="eye" style={{ color: 'blue' }} />
          </Button>
        ),
      },
    ];
  }

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
        && moment(declaration.transmittedAt).format('YYYY/MM/DD HH:mm:ss'),
      verified:
        declaration.review && declaration.review.isVerified ? 'oui' : 'non',
      notes: (declaration.review && declaration.review.notes) || '',
    }));


    return (
      <ZnTable
        rowKey="id"
        size="small"
        style={{ backgroundColor: 'white' }}
        columns={this.COLUMNS}
        dataSource={data}
      />
    );
  }
}

export default withRouter(DeclarationTable);
