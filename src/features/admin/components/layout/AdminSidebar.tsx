import { Users, FileText, Database } from 'lucide-react';

import { NavLink } from 'react-router-dom';

const items = [
  {
    label: 'Users',

    icon: Users,

    to: '/admin/users',
  },

  {
    label: 'Templates',

    icon: FileText,

    to: '/admin/templates',
  },

  {
    label: 'Resources',

    icon: Database,

    to: '/admin/resources',
  },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 border-r bg-card">
      <div className="p-6">
        <h2 className="text-xl font-bold">Admin</h2>
      </div>

      <nav className="space-y-2 px-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-muted"
          >
            <item.icon size={18} />

            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
