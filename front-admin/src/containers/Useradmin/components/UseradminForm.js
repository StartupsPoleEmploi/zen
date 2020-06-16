// @flow

import React from 'react';
import {
  Form, Input, Button, Select,
} from 'antd';

type Props = {
  form: Object,
  mode: 'add' | 'edit',
  useradmin: Object,
  onSubmit: Function,
}

function UseradminForm({
  form, useradmin = {}, onSubmit, mode,
}: Props) {
  const { getFieldDecorator } = form;

  const onHandleSubmit = (e) => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        const data = { ...values };
        if (!data.password) delete data.password;

        onSubmit(data);
      }
    });
  };

  return (
    <Form onSubmit={onHandleSubmit}>
      <Form.Item label="Prénom">
        {getFieldDecorator('firstName', {
          initialValue: useradmin.firstName,
          rules: [{ required: true, message: 'Prénom invalide!' }],
        })(
          <Input placeholder="Prénom" />,
        )}
      </Form.Item>
      <Form.Item label="Nom">
        {getFieldDecorator('lastName', {
          initialValue: useradmin.lastName,
          rules: [{ required: true, message: 'Nom invalide!' }],
        })(
          <Input placeholder="Nom" />,
        )}
      </Form.Item>
      <Form.Item label="E-mail">
        {getFieldDecorator('email', {
          initialValue: useradmin.email,
          rules: [
            { type: 'email', message: 'Invalide E-mail!' },
            { required: true, message: 'Invalide E-mail!' },
          ],
        })(<Input disabled={mode === 'edit'} />)}
      </Form.Item>
      <Form.Item label="Password" hasFeedback>
        {getFieldDecorator('password', {
          initialValue: useradmin.password,
          rules: [
            { required: mode === 'add', message: 'Invalide password!' },
            { min: 6, message: '6 characteres minimum' },
          ],
        })(<Input.Password />)}
      </Form.Item>
      <Form.Item label="Type" hasFeedback>
        {getFieldDecorator('type', {
          initialValue: useradmin.type,
          rules: [
            { required: true, message: 'Invalide Type!' },
          ],
        })(
          <Select>
            <Select.Option value="viewer">Standard</Select.Option>
            <Select.Option value="admin">Admin</Select.Option>
          </Select>,
        )}
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button">
          Log in
        </Button>
      </Form.Item>
    </Form>
  );
}

export default Form.create({ name: 'useradmin_form' })(UseradminForm);
