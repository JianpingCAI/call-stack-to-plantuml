# Call Stack to PlantUML

This Visual Studio Code extension allows you to copy the current call stack from an active debug session and generate a PlantUML Activity diagram script. You can then visualize the call stack using PlantUML.

## Features

- Copies the call stack from the user-selected thread in an active debug session
- Generates a PlantUML Activity diagram script from the call stack
- Stores the generated PlantUML script in the clipboard for easy pasting

## Installation

1. Install the extension from the Visual Studio Code marketplace by searching for "Call Stack to PlantUML" or visit the [extension page](https://marketplace.visualstudio.com/items?itemName=your-publisher-name.call-stack-to-plantuml).
2. Restart Visual Studio Code if needed.

## Usage

1. Open a project in Visual Studio Code and start a debug session.
2. Once you've hit a breakpoint, and the call stack is available, open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P).
3. Search for and run the "Copy Call Stack to PlantUML" command.
4. Select the thread you want to copy the call stack from.
5. The PlantUML Activity diagram script will be copied to your clipboard.
6. Paste the script into a PlantUML editor (online or offline) to visualize the Activity diagram.

### Support of Multiple Call Stack Paths with Additional Commands

1. "Record Call Stack": run this command to store the current call stack, and merge to the existing ones if any.
2. "Clear Recorded Call Stack": to clear the stored call stack info.

### `maxLength` Configuration

The `maxLength` configuration setting allows you to customize the maximum line length for PlantUML diagrams. When the line length exceeds this limit, the `autoWordWrap` function will automatically wrap the text to the next line at the nearest `,` when possible. This makes your diagrams more readable and manageable.

To set your preferred maximum line length, add the following configuration to your Visual Studio Code `settings.json` file:

```json
"call-stack-to-plantuml.maxLength": 60
```

### TODO 

To attach some screenshots.

## Contributing

If you'd like to contribute to the development of this extension, feel free to submit a pull request on the GitHub repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Changelog

For details on updates and changes, refer to the [CHANGELOG](CHANGELOG.md) file.

## Acknowledgments

- The Visual Studio Code team and the vscode-debugprotocol package for providing the necessary APIs for debugging support.
- PlantUML for providing an easy-to-use language to represent diagrams.