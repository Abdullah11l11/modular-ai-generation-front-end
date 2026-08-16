import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  users: number;

  templates: number;

  resources: number;
}

export function AdminStats({
  users,

  templates,

  resources,
}: Props) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold">{users}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold">{templates}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold">{resources}</div>
        </CardContent>
      </Card>
    </div>
  );
}
