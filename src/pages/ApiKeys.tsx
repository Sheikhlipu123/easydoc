import { useState } from 'react';
import { Button, Card, Table, Title, TextInput, NumberInput, Modal } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export default function ApiKeys() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKey, setNewKey] = useState({
    name: '',
    hourlyLimit: 100,
    monthlyLimit: 1000
  });

  const queryClient = useQueryClient();

  const { data: apiKeys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const createKeyMutation = useMutation({
    mutationFn: async (keyData: typeof newKey) => {
      const { data, error } = await supabase
        .from('api_keys')
        .insert([{
          name: keyData.name,
          hourly_limit: keyData.hourlyLimit,
          monthly_limit: keyData.monthlyLimit
        }]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setIsCreateModalOpen(false);
      setNewKey({ name: '', hourlyLimit: 100, monthlyLimit: 1000 });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title order={2}>API Keys</Title>
        <Button onClick={() => setIsCreateModalOpen(true)}>Create New Key</Button>
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>API Key</th>
              <th>Hourly Limit</th>
              <th>Monthly Limit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys?.map((key) => (
              <tr key={key.id}>
                <td>{key.name}</td>
                <td>{key.key}</td>
                <td>{key.hourly_limit}</td>
                <td>{key.monthly_limit}</td>
                <td>{key.active ? 'Active' : 'Inactive'}</td>
                <td>
                  <Button variant="subtle" color="red" size="xs">
                    Revoke
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New API Key"
      >
        <div className="space-y-4">
          <TextInput
            label="Key Name"
            value={newKey.name}
            onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
          />
          <NumberInput
            label="Hourly Limit"
            value={newKey.hourlyLimit}
            onChange={(val) => setNewKey({ ...newKey, hourlyLimit: val || 0 })}
          />
          <NumberInput
            label="Monthly Limit"
            value={newKey.monthlyLimit}
            onChange={(val) => setNewKey({ ...newKey, monthlyLimit: val || 0 })}
          />
          <Button
            fullWidth
            onClick={() => createKeyMutation.mutate(newKey)}
            loading={createKeyMutation.isPending}
          >
            Create Key
          </Button>
        </div>
      </Modal>
    </div>
  );
}