import { NavLink } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  return (
    <div className="flex flex-col gap-2">
      <NavLink
        component={Link}
        to="/"
        label="Dashboard"
        active={location.pathname === '/'}
      />
      <NavLink
        component={Link}
        to="/api-keys"
        label="API Keys"
        active={location.pathname === '/api-keys'}
      />
    </div>
  );
}