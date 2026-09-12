import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert, Button, Card, Form, Input, Typography } from "antd";

import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth/useAuthStore";

import styles from "./Login.module.css";

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (values) => {
    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login({
        username: values.username.trim(),
        password: values.password,
      });

      navigate(ROUTES.DASHBOARD, {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(error?.message ?? "Не удалось выполнить вход.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.root}>
      <Card className={styles.card}>
        <div className={styles.heading}>
          <Title level={3} className={styles.title}>
            Finance CRM
          </Title>

          <Text type="secondary">Войдите в систему</Text>
        </div>

        {errorMessage && (
          <Alert
            className={styles.error}
            type="error"
            showIcon
            message={errorMessage}
          />
        )}

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            label="Логин"
            name="username"
            rules={[
              {
                required: true,
                message: "Введите логин.",
              },
            ]}
          >
            <Input autoFocus autoComplete="username" placeholder="Логин" />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[
              {
                required: true,
                message: "Введите пароль.",
              },
            ]}
          >
            <Input.Password
              autoComplete="current-password"
              placeholder="Пароль"
            />
          </Form.Item>

          <Form.Item className={styles.submitItem}>
            <Button
              block
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Войти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
