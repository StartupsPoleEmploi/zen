// @flow

import React from 'react';
import {
  Table, Input, Button, Icon,
} from 'antd';

type Props = {
  columns: Array<{ znSearchable: boolean, znSort: 'string' | 'number' }>,
  dataSource: Array<Object>,
};

type State = {
  totalRowFilter: Number,
  filters: any,
};

export default class ZnTable extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.searchInput = null;
    this.state = {
      totalRowFilter: props.dataSource.length,
      dataSource: props.dataSource,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.dataSource !== state.dataSource) {
      return {
        totalRowFilter: props.dataSource.length,
        dataSource: props.dataSource,
      };
    }
    return null;
  }

  handleTableChange = (pagination, filters, sorter, extra) => {
    this.setState({ totalRowFilter: extra.currentDataSource.length });
  };

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
      const newCol = {
        ellipsis: false,
        title: c.dataIndex,
        key: c.dataIndex,
        znSearchable: true,
        znSort: 'string',
        ...c,
      };
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
    const { columns, dataSource, ...rest } = this.props;
    const { totalRowFilter } = this.state;
    const hasFilter = totalRowFilter !== dataSource.length;

    return (
      <Table
        pagination={{ pageSize: 15 }}
        columns={this.formatColumns(columns)}
        dataSource={dataSource}
        onChange={this.handleTableChange}
        footer={() => (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {hasFilter
              ? <b>{`Total search: ${totalRowFilter} of ${dataSource.length}`}</b>
              : <b>{`Total: ${dataSource.length} `}</b>}
          </div>
        )}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}
      />
    );
  }
}
