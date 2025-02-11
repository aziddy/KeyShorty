import { useState, useEffect } from 'react';
import { Keyboard, Plus } from 'lucide-react';
import { Button } from './components/ui/button';
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
      setNewShortcut({ key_combination: '', description: '' });
    } catch (error) {
      console.error('Error adding shortcut:', error);
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

      <div className="grid gap-6">
        {applications.map((app) => (
          <div key={app.id} className="rounded-lg border bg-card text-card-foreground shadow">
            <div className="flex items-center justify-between p-6">
              <h2 className="text-2xl font-semibold">{app.name}</h2>
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
            </div>
            <div className="p-6 pt-0">
              {shortcuts[app.id]?.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between py-2 border-t first:border-t-0"
                >
                  <div>
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                      {shortcut.key_combination}
                    </code>
                    <p className="text-sm text-muted-foreground mt-1">
                      {shortcut.description}
                    </p>
                  </div>
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
