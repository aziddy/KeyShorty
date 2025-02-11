import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import KeyboardIcon from '@mui/icons-material/Keyboard';

interface Application {
  id: number;
  name: string;
}

interface Shortcut {
  id: number;
  application_id: number;
  key_combination: string;
  description: string;
}

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [shortcuts, setShortcuts] = useState<{ [key: number]: Shortcut[] }>({});
  const [openAppDialog, setOpenAppDialog] = useState(false);
  const [openShortcutDialog, setOpenShortcutDialog] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newShortcut, setNewShortcut] = useState({
    key_combination: '',
    description: ''
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/applications');
      const data = await response.json();
      setApplications(data);
      data.forEach((app: Application) => {
        fetchShortcuts(app.id);
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchShortcuts = async (appId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/applications/${appId}/shortcuts`);
      const data = await response.json();
      setShortcuts(prev => ({ ...prev, [appId]: data }));
    } catch (error) {
      console.error('Error fetching shortcuts:', error);
    }
  };

  const handleAddApplication = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newAppName }),
      });
      const data = await response.json();
      setApplications([...applications, data]);
      setOpenAppDialog(false);
      setNewAppName('');
    } catch (error) {
      console.error('Error adding application:', error);
    }
  };

  const handleAddShortcut = async () => {
    if (!selectedApp) return;
    try {
      const response = await fetch('http://localhost:3001/api/shortcuts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: selectedApp.id,
          ...newShortcut
        }),
      });
      const data = await response.json();
      setShortcuts(prev => ({
        ...prev,
        [selectedApp.id]: [...(prev[selectedApp.id] || []), data]
      }));
      setOpenShortcutDialog(false);
      setNewShortcut({ key_combination: '', description: '' });
    } catch (error) {
      console.error('Error adding shortcut:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <KeyboardIcon fontSize="large" />
          KeyShorty
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAppDialog(true)}
          >
            Add Application
          </Button>
        </Box>

        {applications.map((app) => (
          <Paper key={app.id} sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{app.name}</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedApp(app);
                  setOpenShortcutDialog(true);
                }}
              >
                Add Shortcut
              </Button>
            </Box>
            <List>
              {shortcuts[app.id]?.map((shortcut) => (
                <ListItem key={shortcut.id}>
                  <ListItemText
                    primary={shortcut.key_combination}
                    secondary={shortcut.description}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        ))}
      </Box>

      {/* Add Application Dialog */}
      <Dialog open={openAppDialog} onClose={() => setOpenAppDialog(false)}>
        <DialogTitle>Add New Application</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Application Name"
            fullWidth
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAppDialog(false)}>Cancel</Button>
          <Button onClick={handleAddApplication} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Add Shortcut Dialog */}
      <Dialog open={openShortcutDialog} onClose={() => setOpenShortcutDialog(false)}>
        <DialogTitle>Add New Shortcut</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Key Combination"
            fullWidth
            value={newShortcut.key_combination}
            onChange={(e) => setNewShortcut(prev => ({ ...prev, key_combination: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={newShortcut.description}
            onChange={(e) => setNewShortcut(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShortcutDialog(false)}>Cancel</Button>
          <Button onClick={handleAddShortcut} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;
