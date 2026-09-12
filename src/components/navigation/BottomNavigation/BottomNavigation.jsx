import { NavLink } from "react-router-dom";

import { BOTTOM_NAVIGATION_ITEMS } from "@/constants/navigation";

import styles from "./BottomNavigation.module.css";

export default function BottomNavigation() {
  return (
    <nav className={styles.root}>
      <div className={styles.tabs}>
        {BOTTOM_NAVIGATION_ITEMS.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              [styles.tab, isActive ? styles.active : ""]
                .filter(Boolean)
                .join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
