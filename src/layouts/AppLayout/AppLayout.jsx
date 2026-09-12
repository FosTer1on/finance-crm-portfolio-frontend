import { Dropdown } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Outlet } from "react-router-dom";

import BottomNavigation from "@/components/navigation/BottomNavigation/BottomNavigation";
import { useAuthStore } from "@/store/auth/useAuthStore";

import styles from "./AppLayout.module.css";

export default function AppLayout() {
  const user = useAuthStore((state) => state.user);

  const logout = useAuthStore((state) => state.logout);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.username ||
    "Пользователь";

  const items = [
    {
      key: "user",
      disabled: true,
      label: (
        <div className={styles.userInfo}>
          <span className={styles.userName}>{displayName}</span>

          {user?.username && displayName !== user.username && (
            <span className={styles.userUsername}>@{user.username}</span>
          )}
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Выйти",
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.accountArea}>
        <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
          <button type="button" className={styles.accountButton}>
            <UserOutlined />

            <span className={styles.accountName}>{displayName}</span>

            <span className={styles.accountArrow}>▾</span>
          </button>
        </Dropdown>
      </div>

      <main className={styles.content}>
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
}
