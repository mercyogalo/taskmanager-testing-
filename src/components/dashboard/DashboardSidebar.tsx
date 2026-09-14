import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

interface DashboardSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { label: 'Tasks', path: '/dashboard/tasks', icon: <TaskAltRoundedIcon /> },
  { label: 'Profile', path: '/dashboard/profile', icon: <PersonRoundedIcon /> },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    onNavigate?.();
  };

  return (
    <Stack sx={{ height: '100%' }}>
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          My Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage tasks & profile
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar src={user?.avatar} alt={user?.name} sx={{ width: 48, height: 48 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Box>
      </Box>

      <Divider />

      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selected}
                onClick={() => handleNav(item.path)}
                sx={{ borderRadius: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Log out" />
          </ListItemButton>
        </ListItem>
      </List>
    </Stack>
  );
}

export default function DashboardSidebar({ mobileOpen, onMobileClose }: DashboardSidebarProps) {
  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        <SidebarContent onNavigate={onMobileClose} />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
