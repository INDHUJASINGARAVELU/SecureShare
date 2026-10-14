import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MyFilesPage } from '../pages/MyFilesPage';
import { UploadPage } from '../pages/UploadPage';
import { SharePage } from '../pages/SharePage';
import { AccessLinksPage } from '../pages/AccessLinksPage';
import { RecipientPortalPage } from '../pages/RecipientPortalPage';
import { SecurityCenterPage } from '../pages/SecurityCenterPage';
import { SecurityLabPage } from '../pages/SecurityLabPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { AdminPage } from '../pages/AdminPage';
import { AuditorPage } from '../pages/AuditorPage';
import { SettingsPage } from '../pages/SettingsPage';
import { HelpPage } from '../pages/HelpPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RoleGuard } from '../components/common/RoleGuard';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing & Login */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Recipient Download Portal (External / Public Route) */}
      <Route path="/recipient/demo-share/:token" element={<RecipientPortalPage />} />

      {/* Authenticated Dashboard Shell */}
      <Route path="/dashboard" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="my-files" element={<MyFilesPage />} />
        <Route
          path="upload"
          element={
            <RoleGuard allowedRoles={['data_owner']}>
              <UploadPage />
            </RoleGuard>
          }
        />
        <Route
          path="share"
          element={
            <RoleGuard allowedRoles={['data_owner']}>
              <SharePage />
            </RoleGuard>
          }
        />
        <Route path="access-links" element={<AccessLinksPage />} />
        <Route path="security-center" element={<SecurityCenterPage />} />
        <Route path="security-lab" element={<SecurityLabPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route
          path="admin"
          element={
            <RoleGuard allowedRoles={['security_admin']}>
              <AdminPage />
            </RoleGuard>
          }
        />
        <Route
          path="auditor"
          element={
            <RoleGuard allowedRoles={['security_auditor', 'security_admin']}>
              <AuditorPage />
            </RoleGuard>
          }
        />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
