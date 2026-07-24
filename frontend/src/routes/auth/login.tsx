import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { axiosInstance } from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';

const schema = z.object({
  username: z.string().min(1, 'required'),
  password: z.string().min(1, 'required'),
});

type FormValues = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: { username: '', password: '' },
  });

  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const formData = new URLSearchParams();
      formData.append('username', values.username);
      formData.append('password', values.password);
      const res = await axiosInstance.post('/api/v1/jwt/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      setTokens(res.data.access_token, res.data.refresh_token);
      await navigate({ to: '/admin/nomenclature' });
    } catch (e) {
      setServerError((e as Error).message || 'Login failed');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper elevation={0} sx={{ p: 4, width: 360, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} mb={1}>ProductPromo</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>Sign in to continue</Typography>
        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Username"
                  size="small"
                  fullWidth
                  {...field}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Password"
                  type="password"
                  size="small"
                  fullWidth
                  {...field}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />
            <Button variant="contained" type="submit" disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}>
              Sign in
            </Button>
            <Typography variant="caption" color="text.secondary">
              Login: UKR7101004 / 111
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export const Route = createFileRoute('/auth/login')({ component: LoginPage });