import React from 'react';
import {
  Table, Input, Button, Icon,
} from 'antd';

import moment from 'moment';
import PropTypes from 'prop-types';


export default class ActualisationTable extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
    };
  }

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys, selectedKeys, confirm, clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),

    filterIcon: (filtered) => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),

    onFilter: (value, record) => record[dataIndex]
      .toString()
      .toLowerCase()
      .includes(value.toLowerCase()),

    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },

    // eslint-disable-next-line react/destructuring-assignment
    render: (text) => {
      const { searchedColumn, searchText } = this.state;
      if (searchedColumn === dataIndex) {
        return (
          <div
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text.toString()}
          >
            {searchText}
          </div>
        );
      }
      return text;
    },
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  };

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
        sorter: (a, b) => a.id - b.id,
        ...this.getColumnSearchProps('id'),
      },
      {
        title: 'Nom',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        sorter: (a, b) => a.name.localeCompare(b.name),
        ...this.getColumnSearchProps('name'),
      },
      {
        title: 'E-mail',
        dataIndex: 'email',
        key: 'email',
        ellipsis: true,
        sorter: (a, b) => a.name.localeCompare(b.name),
        ...this.getColumnSearchProps('email'),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        ellipsis: true,
        sorter: (a, b) => a.name.localeCompare(b.name),
        ...this.getColumnSearchProps('status'),
      },
      {
        title: 'Transmis le',
        dataIndex: 'transmittedAt',
        key: 'transmittedAt',
        ellipsis: true,
        sorter: (a, b) => a.name.localeCompare(b.name),
        ...this.getColumnSearchProps('transmittedAt'),
      },
      {
        title: 'Notes',
        dataIndex: 'notes',
        key: 'notes',
        ellipsis: true,
        sorter: (a, b) => a.name.localeCompare(b.name),
        ...this.getColumnSearchProps('notes'),
      },
    ];
    return (
      <Table
        indentSize={3}
        size="small"
        style={{ backgroundColor: 'white' }}
        columns={columns}
        dataSource={data}
      />
    );
  }
}

ActualisationTable.propTypes = {
  declarations: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};
