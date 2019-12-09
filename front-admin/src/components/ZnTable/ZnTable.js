// @flow

import React from 'react';
import {
  Table, Input, Button, Icon,
} from 'antd';

type Props = {
  columns: Array<{ znSearchable: boolean, znSort: 'string' | 'number' }>,
};

const State = {
  searchText: String,
  searchedColumn: String,
};

export default class ZnTable extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.searchInput = null;
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

    onFilter: (value, record) => `${record[dataIndex]}`
      .toString()
      .toLowerCase()
      .includes(value.toLowerCase()),

    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
  };

  handleReset = (clearFilters) => {
    clearFilters();
  };

  formatColumns(columns) {
    return columns.map((c) => {
      const newCol = { ...c };
      // manage searchable
      if (newCol.znSearchable) {
        Object.assign(newCol, this.getColumnSearchProps(c.dataIndex));
      }
      // manage sorter
      if (newCol.znSort) {
        const key = newCol.dataIndex;
        if (newCol.znSort === 'number') {
          newCol.sorter = (a, b) => a[key] - b[key];
        } else {
          newCol.sorter = (a, b) => `${a[key]}`.localeCompare(`${b[key]}`);
        }
      }
      return newCol;
    });
  }

  render() {
    const { columns, ...rest } = this.props;

    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Table columns={this.formatColumns(columns)} {...rest} />
    );
  }
}
