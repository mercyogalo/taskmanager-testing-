import * as React from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { readImageAsDataUrl } from '../services/storage';

export default function ProfilePage() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPasswordError('Please select a valid image file.');
      return;
    }
    try {
      const dataUrl = await readImageAsDataUrl(file);
      const result = await updateProfile({ avatar: dataUrl });
      if (result.success) {
        setSuccessMessage('Profile image updated successfully.');
        setPasswordError('');
      } else {
        setPasswordError(result.error ?? 'Failed to update image.');
      }
    } catch {
      setPasswordError('Failed to read image file.');
    }
    event.target.value = '';
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    setSuccessMessage('');

    if (!user) return;
    if (currentPassword !== user.password) {
      setPasswordError('Current password is incorrect.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    const result = await updateProfile({ password: newPassword });
    if (result.success) {
      setSuccessMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(result.error ?? 'Failed to update password.');
    }
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    navigate('/');
  };

  if (!user) return null;

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage your account settings
        </Typography>
      </Box>

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      {passwordError && (
        <Alert severity="error" onClose={() => setPasswordError('')}>
          {passwordError}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={3} alignItems="center">
          <Avatar src={user.avatar} alt={user.name} sx={{ width: 120, height: 120 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
          <Button
            variant="outlined"
            startIcon={<PhotoCameraRoundedIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            Update profile image
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Change password
        </Typography>
        <Box component="form" onSubmit={handlePasswordUpdate} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl>
            <FormLabel htmlFor="current-password">Current password</FormLabel>
            <TextField
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              fullWidth
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="new-password">New password</FormLabel>
            <TextField
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              fullWidth
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="confirm-password">Confirm new password</FormLabel>
            <TextField
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
            />
          </FormControl>
          <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
            Update password
          </Button>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, borderColor: 'error.light' }}>
        <Typography variant="h6" color="error" sx={{ mb: 1 }}>
          Danger zone
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Permanently delete your account and all associated tasks. This action cannot be undone.
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteForeverRoundedIcon />}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete account
        </Button>
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? All your tasks and profile data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteAccount}>
            Delete account
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
