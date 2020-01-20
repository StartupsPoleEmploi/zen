// @flow

import React from 'react';
import { Layout } from 'antd';

import './ZnContent.css';

type Props = {
  children: React.Node,
};
export default function ZnContent(props: Props) {
  const { children, ...rest } = props;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Layout.Content className="zn-content" {...rest}>{children}</Layout.Content>
  );
}
