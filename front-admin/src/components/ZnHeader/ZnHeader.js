// @flow

import React from 'react';
import { Layout, Typography } from 'antd';

import './ZnHeader.css';

const { Header } = Layout;
const { Title } = Typography;

type Props = {
  title: string,
};
export default function ZnHeader(props: Props) {
  const { title, ...rest } = props;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Header className="zn-header" {...rest}>
      <Title style={{ color: '#fff' }}>{title}</Title>
    </Header>
  );
}
