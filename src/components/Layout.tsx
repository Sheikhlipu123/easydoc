import { AppShell, Navbar, Header } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

export default function Layout() {
  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar width={{ base: 300 }} p="xs">
          <Navigation />
        </Navbar>
      }
      header={
        <Header height={60} p="xs">
          <div className="flex items-center h-full">
            <h1 className="text-xl font-bold">API Manager</h1>
          </div>
        </Header>
      }
    >
      <Outlet />
    </AppShell>
  );
}