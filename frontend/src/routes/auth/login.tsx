import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { axiosInstance } from '../../api/axiosInstance';
import { BASE_URL } from '../../utils/eNums';
import { useAuthStore } from '../../store/authStore';

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true); setError(null);
    try {
      const res = await axiosInstance.post(`${BASE_URL}/auth/login`, { username, password });
      login({ access_token: res.data.access_token, user: res.data.user });
      await navigate({ to: '/admin/nomenclature' });
    } catch (e) {
      setError((e as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper elevation={0} sx={{ p: 4, width: 360, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} mb={1}>ProductPromo</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>Sign in to continue</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Username" size="small" fullWidth value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField label="Password" type="password" size="small" fullWidth value={password}
            onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          <Button variant="contained" onClick={submit} disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}>
            Sign in
          </Button>
          <Typography variant="caption" color="text.secondary">
            Dev mode: any credentials are accepted.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export const Route = createFileRoute('/auth/login')({ component: LoginPage });
