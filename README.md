# KeyShorty - Keyboard Shortcuts Manager

KeyShorty is a simple and elegant application to help you keep track of keyboard shortcuts for different applications. Never forget a useful keyboard shortcut again!

## Features

- Create and manage lists of applications
- Add keyboard shortcuts with descriptions for each application
- Clean and intuitive Material UI interface
- Data persistence using SQLite
- Fast and responsive React frontend

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation


1. Install dependencies:
```bash
npm install
```

## Running the Application

To run both the frontend and backend servers simultaneously:

```bash
npm run dev
```

This will start:
- Frontend server at http://localhost:5173
- Backend server at http://localhost:3001

## Usage

1. Click "Add Application" to create a new application entry
2. For each application, click "Add Shortcut" to add new keyboard shortcuts
3. Enter the key combination (e.g., "Ctrl+C") and its description
4. Your shortcuts will be automatically saved to the database

## Development

- Frontend: React with TypeScript and Material UI
- Backend: Express.js with SQLite database
- Build tool: Vite

