import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { useAuth } from '../context/AuthContext';
import { getTasks, saveTasks } from '../services/storage';
import type { Task } from '../types/task';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = React.useState('');
  const [titleError, setTitleError] = React.useState('');
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  const loadTasks = React.useCallback(() => {
    if (!user) return;
    setTasks(getTasks(user.id));
  }, [user]);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const persistTasks = (nextTasks: Task[]) => {
    if (!user) return;
    saveTasks(user.id, nextTasks);
    setTasks(nextTasks);
  };

  const openAddDialog = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTitleError('');
    setDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTitleError('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
    setTaskTitle('');
    setTitleError('');
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim()) {
      setTitleError('Task title is required.');
      return;
    }
    if (!user) return;

    if (editingTask) {
      const next = tasks.map((task) =>
        task.id === editingTask.id ? { ...task, title: taskTitle.trim() } : task,
      );
      persistTasks(next);
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        userId: user.id,
        title: taskTitle.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      persistTasks([newTask, ...tasks]);
    }
    closeDialog();
  };

  const handleToggleComplete = (task: Task) => {
    const next = tasks.map((item) =>
      item.id === task.id ? { ...item, completed: !item.completed } : item,
    );
    persistTasks(next);
    if (!task.completed) {
      setToastMessage(`Task completed: "${task.title}"`);
      setToastOpen(true);
    }
  };

  const handleDelete = (taskId: string) => {
    persistTasks(tasks.filter((task) => task.id !== taskId));
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 800 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, update, and track your tasks
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh tasks">
            <IconButton onClick={loadTasks} aria-label="Refresh tasks">
              <RefreshRoundedIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAddDialog}>
            Add task
          </Button>
        </Stack>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        {tasks.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No tasks yet. Click &quot;Add task&quot; to get started.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {tasks.map((task, index) => (
              <ListItem
                key={task.id}
                divider={index < tasks.length - 1}
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit task">
                      <IconButton edge="end" aria-label="Edit task" onClick={() => openEditDialog(task)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete task">
                      <IconButton edge="end" aria-label="Delete task" onClick={() => handleDelete(task.id)}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
                sx={{ py: 1.5, pr: 12 }}
              >
                <ListItemIcon sx={{ minWidth: 42 }}>
                  <Checkbox
                    edge="start"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task)}
                    inputProps={{ 'aria-label': `Mark "${task.title}" as complete` }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={task.title}
                  secondary={new Date(task.createdAt).toLocaleString()}
                  slotProps={{
                    primary: {
                      sx: {
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'text.secondary' : 'text.primary',
                      },
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingTask ? 'Update task' : 'Add task'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task title"
            fullWidth
            value={taskTitle}
            onChange={(e) => {
              setTaskTitle(e.target.value);
              setTitleError('');
            }}
            error={Boolean(titleError)}
            helperText={titleError}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTask();
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTask}>
            {editingTask ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
