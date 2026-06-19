import { createBrowserRouter } from 'react-router';
import React from 'react';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LabIntroPage } from './pages/LabIntroPage';
import { NewsPage } from './pages/NewsPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { ExperimentDetailPage } from './pages/ExperimentDetailPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CourseLearningPage } from './pages/CourseLearningPage';
import { ResourceCenterPage } from './pages/ResourceCenterPage';
import { AppCenterPage } from './pages/AppCenterPage';
import { StudentWorkbench } from './pages/StudentWorkbench';
import { TeacherWorkbench } from './pages/TeacherWorkbench';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ExperimentsManagePage } from './pages/admin/ExperimentsManagePage';
import { CoursesManagePage } from './pages/admin/CoursesManagePage';
import { ResourcesManagePage } from './pages/admin/ResourcesManagePage';
import { AppsManagePage } from './pages/admin/AppsManagePage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'lab-intro', Component: LabIntroPage },
      { path: 'news', Component: NewsPage },
      { path: 'news/:id', Component: NewsPage },
      { path: 'experiments', Component: ExperimentsPage },
      { path: 'experiments/:id', Component: ExperimentDetailPage },
      { path: 'courses', Component: CoursesPage },
      { path: 'courses/:id', Component: CourseDetailPage },
      { path: 'courses/:id/learn', Component: CourseLearningPage },
      { path: 'resources', Component: ResourceCenterPage },
      { path: 'apps', Component: AppCenterPage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      {
        path: 'student',
        element: (
          <ProtectedRoute>
            <StudentWorkbench />
          </ProtectedRoute>
        ),
      },
      {
        path: 'teacher',
        element: (
          <ProtectedRoute requiredRole="teacher">
            <TeacherWorkbench />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'users', Component: UserManagementPage },
      { path: 'experiments', Component: ExperimentsManagePage },
      { path: 'courses', Component: CoursesManagePage },
      { path: 'resources', Component: ResourcesManagePage },
      { path: 'apps', Component: AppsManagePage },
    ],
  },
]);