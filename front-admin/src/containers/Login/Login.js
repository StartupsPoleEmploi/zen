import React, { useState, useEffect } from 'react';
import superagent from 'superagent';
import {
  Form, Input, Button, Spin, Row, Col,
} from 'antd';

import ZnContent from '../../components/ZnContent';
import ZnHeader from '../../components/ZnHeader';
import { useUseradmin } from '../../common/contexts/useradminCtx';


async function loginUser({ email, password }) {
  return superagent
    .post('/zen-admin-api/login', { email, password })
    .then(({ body }) => body);
}

async function autologin() {
  return superagent.get('/zen-admin-api/autologin')
    .then(({ body }) => body)
    .catch(() => null);
}

type Props = { form: Object }

function Login({ form }: Props) {
  const [isLoading, _setIsLoading] = useState(false);
  const { setUseradmin } = useUseradmin();
  const { getFieldDecorator } = form;

  useEffect(() => {
    _setIsLoading(true);
    autologin()
      .then(setUseradmin)
      .then(() => _setIsLoading(false));
  }, [setUseradmin]);

  const login = ({ email, password }) => {
    _setIsLoading(true);
    loginUser({ email, password })
      .then(setUseradmin)
      .then(() => _setIsLoading(false))
      .catch(() => _setIsLoading(false));
  };

  const onHandleSubmit = (e) => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        login(values);
      }
    });
  };

  if (isLoading) {
    return <Spin />;
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <ZnHeader title="Connexion" />
      <ZnContent>
        <Row type="flex" justify="center">
          <Col span={12}>
            <Form onSubmit={onHandleSubmit}>
              <Form.Item label="E-mail">
                {getFieldDecorator('email', {
                  rules: [
                    { type: 'email', message: 'Invalide E-mail!' },
                    { required: true, message: 'Invalide E-mail!' },
                  ],
                })(<Input />)}
              </Form.Item>
              <Form.Item label="Password" hasFeedback>
                {getFieldDecorator('password', {
                  rules: [
                    { required: true, message: 'Invalide password!' },
                    { min: 6, message: '6 characteres minimum' },
                  ],
                })(<Input.Password />)}
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  Log in
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </ZnContent>
    </div>
  );
}

export default Form.create({ name: 'login_form' })(Login);
