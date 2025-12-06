# Script-Shelf

Script-Shelf is a simple, organized way to store and retrieve code snippets. Whether you're working in the browser, your editor, or the web app, the goal is the same: keep useful snippets in one place and make them easy to find later.

## Features

- User registration and login across web app and extensions
- Save and organize snippets with tags, folders, favorites, and version history  
- Clean web UI for browsing and editing  
- Chrome extension for quick saving from the browser  
- VSCode extension for pulling snippets directly into your editor  
- Shared backend so everything stays synced

## Repository Structure

```
script-shelf/
├── client/             # Web frontend
├── server/             # Backend API + Node Routes
├── chrome-extension/   # Browser extension
├── vscode-extension/   # VSCode extension
├── features/           # Cucumber Testing
└── README.md
```

## Getting Started -- Web App

The repo refers to a separate setup guide with full environment variable and database instructions. Basic steps:

1. Clone the repo:
   ```bash
   git clone https://github.com/AshwinJ127/script-shelf.git
   cd script-shelf
   ```

2. Install dependencies in root folder using npm install

3. Add the required '.env' files (request for access, if TA -> see slide 2 on submitted presentation).

4. Run any necessary database migrations.

5. Start the backend and frontend in development mode.

You’ll need access to the shared setup doc to fully configure the environment.

## Getting Started -- Chrome Extension

Once the repo is cloned onto your machine:

1. Open Google Chrome and navigate to chrome://extensions/.

2. Toggle Developer mode in the top right corner.

3. Click Load unpacked.

4. Select the chrome-extension folder located inside the cloned repository.

5. The extension should now appear in your toolbar.

## Getting Started -- VSCode Extension

1. Locate the .vsix file within the vscode-extension directory.

2. Open VS Code and navigate to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X).

3. Click the "..." (Views and More Actions) menu in the top right corner of the Extensions sidebar.

4. Select Install from VSIX....

5. Browse to and select the .vsix file to complete the installation.

## Usage

- Create an account then log in on the web app
- Add snippets through the web app or one of the extensions  
- Tag snippets and sort them into folders so they’re easy to search and filter  
- Edit, copy, or delete snippets whenever needed 
- View version history for your snippets to see past versions
- One-click copy from the web app or copy from the extensions to use your code whenever needed 
- NOTE FOR TA: Please wait up to two minutes on first use due to backend cold-starting

## Contributing

Pull requests and issues are welcome. Backend-related changes may require access to the private setup instructions. If you're unsure, just ask or open an issue first.

## Project Diagrams

1. User Login Authentication Sequence Diagram

(https://github.com/user-attachments/assets/bec67731-96d5-4315-96f6-d2ff9cdfc6b4)

2. Database Design Entity Relationship Diagram

(https://github.com/user-attachments/assets/89b3c4a1-a662-4aed-8e74-538348c0fce3)


## License

This project is licensed under the MIT License.
