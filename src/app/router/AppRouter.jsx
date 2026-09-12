import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/app/router/ProtectedRoute";
import PublicRoute from "@/app/router/PublicRoute";

import { ROUTES } from "@/constants/routes";

import Login from "@/pages/Login/Login";
import Dashboard from "@/pages/Dashboard/Dashboard";
import Clearing from "@/pages/Clearing/Clearing";
import Asia from "@/pages/Asia/Asia";
import Tarle from "@/pages/Tarle/Tarle";
import DenXan from "@/pages/DenXan/DenXan";
import Mma from "@/pages/Mma/Mma";
import Cash from "@/pages/Cash/Cash";
import Debts from "@/pages/Debts/Debts";

import DevUi from "@/pages/DevUi/DevUi";

import AppLayout from "@/layouts/AppLayout/AppLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path={ROUTES.LOGIN} element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

            <Route path={ROUTES.CLEARING} element={<Clearing />} />

            <Route path={ROUTES.ASIA} element={<Asia />} />

            <Route path={ROUTES.TARLE} element={<Tarle />} />

            <Route path={ROUTES.DEN_XAN} element={<DenXan />} />

            <Route path={ROUTES.MMA} element={<Mma />} />

            <Route path={ROUTES.CASH} element={<Cash />} />

            <Route path={ROUTES.DEBTS} element={<Debts />} />

            <Route path={ROUTES.DEV_UI} element={<DevUi />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
