import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { UsersTable } from '@/features/admin/components/users2/UsersTable';

import { TemplatesTable } from '@/features/admin/components/templates/TemplatesTable';

import { ResourcesTable } from '@/features/admin/components/resources/ResourcesTable';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">User</TabsTrigger>

          <TabsTrigger value="templates">Templates</TabsTrigger>

          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTable />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesTable />
        </TabsContent>

        <TabsContent value="resources">
          <ResourcesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
