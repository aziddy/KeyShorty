import { useState, useEffect } from 'react';
import { Keyboard, Plus, Trash2 } from 'lucide-react';
import { Button } from './components/ui/button';
import { useError } from '@/lib/error-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog"

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
  const { showError } = useError();
  const [applications, setApplications] = useState<Application[]>([]);
  const [shortcuts, setShortcuts] = useState<{ [key: number]: Shortcut[] }>({});
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
      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.statusText}`);
      }
      const data = await response.json();
      setApplications(data);
      data.forEach((app: Application) => {
        fetchShortcuts(app.id);
      });
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to fetch applications');
    }
  };

  const fetchShortcuts = async (appId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/applications/${appId}/shortcuts`);
      if (!response.ok) {
        throw new Error(`Failed to fetch shortcuts: ${response.statusText}`);
      }
      const data = await response.json();
      setShortcuts(prev => ({ ...prev, [appId]: data }));
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to fetch shortcuts');
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add application: ${response.statusText}`);
      }
      const data = await response.json();
      setApplications([...applications, data]);
      setNewAppName('');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to add application');
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add shortcut: ${response.statusText}`);
      }
      const data = await response.json();
      setShortcuts(prev => ({
        ...prev,
        [selectedApp.id]: [...(prev[selectedApp.id] || []), data]
      }));
      setNewShortcut({ key_combination: '', description: '' });
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to add shortcut');
    }
  };

  const handleDeleteApplication = async (appId: number) => {
    if (!confirm('Are you sure you want to delete this application and all its shortcuts?')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/applications/${appId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete application: ${response.statusText}`);
      }
      setApplications(applications.filter(app => app.id !== appId));
      delete shortcuts[appId];
      setShortcuts({ ...shortcuts });
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to delete application');
    }
  };

  const handleDeleteShortcut = async (shortcutId: number, appId: number) => {
    if (!confirm('Are you sure you want to delete this shortcut?')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/shortcuts/${shortcutId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete shortcut: ${response.statusText}`);
      }
      setShortcuts(prev => ({
        ...prev,
        [appId]: prev[appId].filter(s => s.id !== shortcutId)
      }));
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to delete shortcut');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Keyboard className="h-8 w-8" />
          <h1 className="text-3xl font-bold">KeyShorty</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Application</DialogTitle>
              <DialogDescription>
                Enter the name of the application you want to track shortcuts for.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <input
                  className="col-span-4 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="Application name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddApplication}>Add Application</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex flex-wrap gap-6">
        {applications.map((app) => (
          <div key={app.id} className="rounded-lg border bg-card text-card-foreground shadow w-full lg:w-[480px]">
            <div className="flex items-center justify-between p-6">
              <h2 className="text-2xl font-semibold">{app.name}</h2>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setSelectedApp(app)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Shortcut
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Shortcut</DialogTitle>
                      <DialogDescription>
                        Add a new keyboard shortcut for {app.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <input
                          className="col-span-4 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          value={newShortcut.key_combination}
                          onChange={(e) => setNewShortcut(prev => ({ ...prev, key_combination: e.target.value }))}
                          placeholder="Key combination (e.g., Ctrl+C)"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <input
                          className="col-span-4 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          value={newShortcut.description}
                          onChange={(e) => setNewShortcut(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddShortcut}>Add Shortcut</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteApplication(app.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete App
                </Button>
              </div>
            </div>
            <div className="p-6 pt-0">
              {shortcuts[app.id]?.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between py-2 border-t first:border-t-0"
                >
                  <div className="flex items-center gap-4">
                    <kbd className="px-2 py-1 bg-muted rounded text-sm font-semibold">
                      {shortcut.key_combination}
                    </kbd>
                    <span>{shortcut.description}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteShortcut(shortcut.id, app.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
