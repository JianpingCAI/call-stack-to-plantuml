# Quick Start: Testing the Extension

## 🚀 Ready to Test

Your C++ test project is set up in `test-cpp-project/`. Follow these steps:

### 0. Compile the Extension (First Time)

Before testing, the extension's TypeScript code must be compiled to JavaScript:

**Option 1 - Watch Mode (Recommended):**

- Press **Ctrl+Shift+B** and select **npm: watch**
- Or run in terminal: `npm run watch`
- This runs `tsc -watch -p ./` which continuously compiles TypeScript to the `out/` folder
- Any code changes are automatically recompiled
- Keep this running in the background

**Option 2 - One-time Compile:**

- Run in terminal: `npm run compile`
- You'll need to recompile manually after each code change

### 1. Press F5 to Start Testing

This will:

- Start the extension in development mode
- Open a new VS Code window with the extension loaded

### 2. In the New Window

1. **Open the test project**: File → Open Folder → Select `test-cpp-project/`
2. **Open main.cpp**
3. **Set breakpoints** on these lines:
   - Line 7 (in `deepFunction`)
   - Line 18 (in `pathB`)
   - Line 23 (in `pathA`)

### 3. Start Debugging

1. Press **F5** (or Run → Start Debugging)
2. The program will compile and start
3. Execution will pause at the first breakpoint

### 4. Test Extension Commands

When paused at a breakpoint, press **Ctrl+Shift+P** and try:

1. **Record Call Stack** - Captures the current call stack
2. **Record Call Stack** (at different breakpoints) - Builds a tree
3. **Copy Call Stack to PlantUML** - Generates the diagram
4. **Clear Recorded Call Stack** - Resets the tree

### 5. View the Diagram

After copying, paste the PlantUML code into:

- [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)
- Or use PlantUML extension in VS Code

## 📊 What You'll See

The extension will generate a diagram showing:

```
@startuml
main -> processData
processData -> pathA
pathA -> pathB
pathB -> deepFunction
pathA -> pathC
pathC -> deepFunction
@enduml
```

## 💡 Tips

- **Record at multiple breakpoints** to capture different execution paths
- **The tree structure** shows which paths are common vs unique
- **Adjust maxLength** setting if function names are too long

## 🐛 Debugging the Extension

If something doesn't work:

1. Check the Debug Console for errors
2. Look at Output → Extension Host
3. Reload the extension development window (Ctrl+R)

Enjoy testing! 🎉
