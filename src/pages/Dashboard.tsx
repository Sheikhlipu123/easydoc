import { Card, Title } from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { data: usageStats } = useQuery({
    queryKey: ['usage-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_usage')
        .select('*')
        .order('timestamp', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <Title order={2}>API Usage Dashboard</Title>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Title order={3}>Total Requests</Title>
          <p className="text-3xl font-bold">{usageStats?.length || 0}</p>
        </Card>
        
        <Card>
          <Title order={3}>Active Keys</Title>
          <p className="text-3xl font-bold">0</p>
        </Card>
        
        <Card>
          <Title order={3}>Total Users</Title>
          <p className="text-3xl font-bold">0</p>
        </Card>
      </div>

      <Card>
        <Title order={3} className="mb-4">Usage Over Time</Title>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={usageStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="requests" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}