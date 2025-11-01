import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AuthLog {
  id: number;
  user_id: number | null;
  username: string;
  action: string;
  ip_address: string;
  user_agent: string;
  status: string;
  created_at: string;
}

interface LogsTabProps {
  authLogs: AuthLog[];
}

const LogsTab = ({ authLogs }: LogsTabProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Логи авторизации</h2>
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Действие</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>User Agent</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Время</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.id}</TableCell>
                  <TableCell>{log.user_id || '-'}</TableCell>
                  <TableCell>{log.username}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="font-mono text-xs">{log.ip_address}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs">{log.user_agent}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      log.status === 'success' 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">{new Date(log.created_at).toLocaleString('ru-RU')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsTab;
