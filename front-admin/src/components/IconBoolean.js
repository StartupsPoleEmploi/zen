/* eslint-disable react/jsx-props-no-spreading */
// @Flow
import React from 'react';
import { Icon } from 'antd';

type Props = {
  val: Boolean,
}

export default function IconBoolean({ val, ...props }: Props) {
  return val ? <Icon type="check" style={{ color: 'green' }} {...props} />
    : <Icon type="close" style={{ color: 'red' }} {...props} />;
}
