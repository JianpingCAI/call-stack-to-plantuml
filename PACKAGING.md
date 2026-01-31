# Packaging and Distribution Guide

This guide explains how to package and distribute the Call Stack to PlantUML VS Code extension.

## Prerequisites

No additional installation needed! The packaging scripts use `npx` to automatically download and run `@vscode/vsce` when needed.

## Creating an Extension Installer (.vsix)

### Quick Method

Use the npm script to package the extension:

```bash
npm run package
```

This will:

1. Run the `vscode:prepublish` script (compile TypeScript)
2. Create a `.vsix` file (e.g., `call-stack-to-plantuml-0.0.7.vsix`)

### Manual Method

Alternatively, run the packaging command directly:

```bash
npx @vscode/vsce package
```

## Installing the Extension Locally

### Option 1: Command Line

Install the generated `.vsix` file using the VS Code CLI:

```bash
code --install-extension call-stack-to-plantuml-0.0.7.vsix
```

### Option 2: VS Code UI

1. Open VS Code
2. Navigate to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Click the `...` (More Actions) menu at the top of the Extensions view
4. Select **"Install from VSIX..."**
5. Browse and select your `.vsix` file
6. Reload VS Code when prompted

### Option 3: Drag and Drop

Simply drag the `.vsix` file into the VS Code Extensions view.

## Sharing the Extension

The generated `.vsix` file can be:

- Shared directly with other users via email, cloud storage, etc.
- Distributed through your organization's internal channels
- Uploaded to a private extension marketplace
- Published to the official VS Code Marketplace (see below)

## Publishing to VS Code Marketplace

### 1. Create a Publisher Account

1. Go to [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. Sign in with your Microsoft account
3. Create a new publisher ID (must match the `publisher` field in `package.json`)

### 2. Generate a Personal Access Token (PAT)

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Click on your profile icon → **User settings** → **Personal access tokens**
3. Click **+ New Token**
4. Configure the token:
   - **Name**: VS Code Extension Publishing
   - **Organization**: All accessible organizations
   - **Expiration**: Custom defined (e.g., 90 days)
   - **Scopes**: Select **Custom defined**
     - Check **Marketplace** → **Manage**
5. Click **Create** and copy the token (you won't see it again!)

### 3. Login with vsce

```bash
npx @vscode/vsce login YourPublisherName
```

Enter your Personal Access Token when prompted.

### 4. Publish the Extension

```bash
npm run publish
```

Or specify a version bump:

```bash
# Patch version (0.0.7 → 0.0.8)
npx @vscode/vsce publish patch

# Minor version (0.0.7 → 0.1.0)
npx @vscode/vsce publish minor

# Major version (0.0.7 → 1.0.0)
npx @vscode/vsce publish major

# Specific version
npx @vscode/vsce publish 1.0.0
```

### 5. Verify Publication

After publishing:

- Check your extension at: `https://marketplace.visualstudio.com/items?itemName=YourPublisher.call-stack-to-plantuml`
- It may take a few minutes to appear in VS Code's extension search

## Pre-Publish Checklist

Before publishing, ensure:

- [ ] `version` in `package.json` is updated
- [ ] `CHANGELOG.md` is updated with new changes
- [ ] `README.md` has accurate documentation
- [ ] All tests pass: `npm test`
- [ ] Code is linted: `npm run lint`
- [ ] Extension compiles without errors: `npm run compile`
- [ ] Extension works correctly when installed locally
- [ ] `publisher` field in `package.json` matches your marketplace publisher ID
- [ ] License file is present and accurate
- [ ] Repository URL is correct in `package.json`

## Version Management

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version (X.0.0): Incompatible API changes
- **MINOR** version (0.X.0): New functionality, backward compatible
- **PATCH** version (0.0.X): Backward compatible bug fixes

## Troubleshooting

### ERROR: Missing publisher name

Ensure `package.json` has a `publisher` field:

```json
{
  "publisher": "YourPublisherName"
}
```

### ERROR: Missing README

Ensure you have a `README.md` file in your project root.

### ERROR: Missing LICENSE

Add a `LICENSE` file to your project root.

### ERROR: ENOENT vsce not found

This should not occur if using the npm scripts or npx commands, as they automatically download `@vscode/vsce`.

Always use `npx @vscode/vsce` instead of `vsce` directly:

```bash
npx @vscode/vsce package
```

### Extension not appearing in Marketplace

- Wait 5-10 minutes for indexing
- Check your publisher dashboard for any warnings
- Verify the extension wasn't flagged during review

## Useful Commands

```bash
# Package without publishing
npm run package

# Publish with version bump
npm run publish

# Show extension info
npx @vscode/vsce show JianpingCai.call-stack-to-plantuml

# List all your published extensions
npx @vscode/vsce ls YourPublisherName

# Unpublish an extension (careful!)
npx @vscode/vsce unpublish YourPublisherName.call-stack-to-plantuml
```

## Additional Resources

- [VS Code Extension Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [VS Code Extension Marketplace](https://marketplace.visualstudio.com/vscode)
- [vsce CLI Documentation](https://github.com/microsoft/vscode-vsce)
- [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)
