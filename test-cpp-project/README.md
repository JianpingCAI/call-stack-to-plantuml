# Testing Call Stack to PlantUML Extension

This is a test C++ project to demonstrate the Call Stack to PlantUML extension.

## Project Structure

- `main.cpp` - A simple C++ program with nested function calls
- `.vscode/launch.json` - Debug configuration
- `.vscode/tasks.json` - Build task configuration

## How to Test the Extension

### Step 1: Open the Project
1. Press `F5` or open the Run and Debug view (Ctrl+Shift+D)
2. The project should compile automatically

### Step 2: Set Breakpoints
Set breakpoints at these locations in `main.cpp`:
- Line 7: Inside `deepFunction()` 
- Line 18: Inside `pathB()`
- Line 23: Inside `pathA()`

### Step 3: Start Debugging
1. Press `F5` to start debugging
2. The program will pause at the first breakpoint

### Step 4: Record Call Stack
When paused at a breakpoint:
1. Open the Command Palette (Ctrl+Shift+P)
2. Run command: **"Record Call Stack"**
3. The extension will capture the current call stack

### Step 5: Record Multiple Call Paths
1. Continue execution (F5) to hit other breakpoints
2. At each breakpoint, run **"Record Call Stack"** again
3. This builds up a tree of different execution paths

### Step 6: Generate PlantUML Diagram
1. Open Command Palette (Ctrl+Shift+P)
2. Run command: **"Copy Call Stack to PlantUML"**
3. The PlantUML script will be copied to clipboard

### Step 7: Visualize the Diagram
Paste the PlantUML script into:
- [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)
- Or use the PlantUML VS Code extension

## Expected Call Stack Paths

### Path 1: processData(15) → pathA() → pathB() → deepFunction()
```
main
└── processData
    └── pathA
        └── pathB
            └── deepFunction
```

### Path 2: processData(15) → pathA() → pathC() → deepFunction()
```
main
└── processData
    └── pathA
        └── pathC
            └── deepFunction
```

### Path 3: processData(5) → pathB() → deepFunction()
```
main
└── processData
    └── pathB
        └── deepFunction
```

## Clearing Recorded Stacks

To start fresh:
1. Open Command Palette (Ctrl+Shift+P)
2. Run command: **"Clear Recorded Call Stack"**

## Troubleshooting

If debugging doesn't work:
- Ensure gdb is installed: `sudo apt install gdb`
- Rebuild: Run the "build" task (Ctrl+Shift+B)
- Check that the binary has debug symbols: `file main` should show "not stripped"
