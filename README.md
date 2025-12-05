# Script-Shelf

Script-Shelf is a simple, organized way to store and retrieve code snippets. Whether you're working in the browser, your editor, or the web app, the goal is the same: keep useful snippets in one place and make them easy to find later.

## Features

- Save and organize snippets with tags and descriptions  
- Clean web UI for browsing and editing  
- Chrome extension for quick saving from the browser  
- VSCode extension for pulling snippets directly into your editor  
- Shared backend so everything stays synced

## Repository Structure

```
script-shelf/
├── client/             # Web frontend
├── server/             # Backend API + database logic
├── chrome-extension/   # Browser extension
├── vscode-extension/   # VSCode extension
├── features/           # Experimental features / work in progress
└── README.md
```

## Getting Started

The repo refers to a separate setup guide with full environment variable and database instructions. Basic steps:

1. Clone the repo:
   ```bash
   git clone https://github.com/AshwinJ127/script-shelf.git
   cd script-shelf
   ```

2. Install dependencies in root folder.

3. Add the required '.env' files (request for access).

4. Run any necessary database migrations.

5. Start the backend and frontend in development mode.

You’ll need access to the shared setup doc to fully configure the environment.

## Usage

- Add snippets through the web app or one of the extensions  
- Tag snippets so they’re easy to search and filter  
- Edit, duplicate, or clean up snippets whenever needed  
- Use the API if you’re integrating Script-Shelf into another workflow

## Contributing

Pull requests and issues are welcome. Backend-related changes may require access to the private setup instructions. If you're unsure, just ask or open an issue first.

## License

This project is licensed under the MIT License.
