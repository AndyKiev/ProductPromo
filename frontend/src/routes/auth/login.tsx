import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { axiosInstance } from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';
import useString from '../../hooks/useString';
import cfl from '../../utils/capitalizeFirstLetter';

const schema = z.object({
  username: z.string().min(1, 'required'),
  password: z.string().min(1, 'required'),
});

type FormValues = z.infer<typeof schema>;

function LoginPage() {
  const getString = useString();
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
      setServerError((e as Error).message || getString('loginFailed'));
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper elevation={0} sx={{ p: 4, width: 360, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} mb={1}>ProductPromo</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>{getString('signInPrompt')}</Typography>
        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  label={getString('username')}
                  size="small"
                  fullWidth
                  {...field}
                  error={!!errors.username}
                  helperText={errors.username?.message && getString(errors.username.message)}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  label={getString('password')}
                  type="password"
                  size="small"
                  fullWidth
                  {...field}
                  error={!!errors.password}
                  helperText={errors.password?.message && getString(errors.password.message)}
                />
              )}
            />
            <Button variant="contained" type="submit" disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}>
              {cfl(getString('signIn'))}
            </Button>
            <Typography variant="caption" color="text.secondary">
              {getString('devLogin')}
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export const Route = createFileRoute('/auth/login')({ component: LoginPage });
