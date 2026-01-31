# Testing Call Stack to PlantUML Extension

This is a test C++ project to demonstrate the Call Stack to PlantUML extension with classes and templated methods.

## Project Structure

- `main.cpp` - A C++ program with classes, templates, and nested function calls
- `.vscode/launch.json` - Debug configuration
- `.vscode/tasks.json` - Build task configuration

## Key Features

This test project includes:
- **Classes**: `DataProcessor` and `Container<T>` classes to test object-oriented call patterns
- **Templated Methods**: Generic functions like `transform<T>()` and `processVector<T>()` 
- **Special Symbols**: Template syntax with `<>` characters to test PlantUML script generation with special symbols
- **Nested Calls**: Multiple call paths through class methods

## How to Test the Extension

### Step 1: Open the Project
1. Press `F5` or open the Run and Debug view (Ctrl+Shift+D)
2. The project should compile automatically

### Step 2: Set Breakpoints
Set breakpoints at these locations in `main.cpp`:
- Line 19: Inside `Container<T>::transform<U>()` (templated method)
- Line 37: Inside `DataProcessor::deepFunction()` 
- Line 71: Inside `DataProcessor::processVector<T>()` (templated method with vector)

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

### Path 1: processData(15) → pathA() → pathB() → deepFunction() → Container::transform()
### Path 2: processData(5) → pathB() → deepFunction() → Container::transform()
### Path 3: processVector() → Container::transform() (with template instantiation)
### Path 4: processGeneric() → Container::transform() (free function template)

## Testing Template Symbols

The extension should properly handle function names containing template syntax:
- `Container<int>::transform<int>()`
- `Container<double>::transform<double>()`
- `DataProcessor::processVector<int>()`
- `processGeneric<double>()`

These names contain `<>` characters which are special characters in PlantUML. The extension should properly escape or handle these when generating the diagram script.

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
