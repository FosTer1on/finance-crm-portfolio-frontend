import { useEffect } from "react";

import AppRouter from "@/app/router/AppRouter";
import { useAuthStore } from "@/store/auth/useAuthStore";

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <AppRouter />;
}
