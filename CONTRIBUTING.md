# Contributing to Call Stack to PlantUML

Thank you for your interest in contributing to Call Stack to PlantUML! This document provides guidelines and instructions for contributing to the project.

## 🎯 Ways to Contribute

There are many ways you can contribute to this project:

- 🐛 **Report Bugs**: Submit detailed bug reports
- 💡 **Suggest Features**: Propose new features or improvements
- 📝 **Improve Documentation**: Enhance README, code comments, or examples
- 🔧 **Fix Issues**: Pick up existing issues and submit fixes
- ✨ **Add Features**: Implement new functionality
- 🧪 **Write Tests**: Improve test coverage
- 🎨 **Improve UI/UX**: Enhance user experience

## 📋 Before You Start

### Prerequisites

- **Node.js**: Version 16.x or higher
- **npm**: Version 7.x or higher
- **VS Code**: Latest version recommended
- **Git**: For version control

### Setup Development Environment

1. **Fork the Repository**

   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/call-stack-to-plantuml.git
   cd call-stack-to-plantuml
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Open in VS Code**

   ```bash
   code .
   ```

5. **Compile TypeScript**

   ```bash
   npm run compile
   # Or for watch mode:
   npm run watch
   ```

6. **Run the Extension**
   - Press `F5` to open a new VS Code window with the extension loaded
   - Set breakpoints in your code to debug

## 🔄 Development Workflow

### 1. Create a Branch

Create a descriptive branch name:

```bash
# For features
git checkout -b feature/add-export-formats

# For bug fixes
git checkout -b fix/thread-selection-crash

# For documentation
git checkout -b docs/improve-readme
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run tests
npm test

# Manual testing
# Press F5 in VS Code to launch extension in debug mode
```

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
# Good commit messages
git commit -m "Add: Support for exporting to SVG format"
git commit -m "Fix: Resolve crash when no threads available"
git commit -m "Docs: Add troubleshooting section to README"

# Format: <type>: <description>
# Types: Add, Fix, Update, Remove, Refactor, Docs, Test, Style
```

### 5. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub.

## 📝 Coding Guidelines

### TypeScript Style

- Use **camelCase** for variables and functions
- Use **PascalCase** for classes and interfaces
- Use **UPPER_CASE** for constants
- Prefer `const` over `let`, avoid `var`
- Use type annotations where types aren't obvious
- Enable strict mode in TypeScript

### Code Organization

```typescript
// 1. Imports
import * as vscode from 'vscode';
import { DebugProtocol } from 'vscode-debugprotocol';

// 2. Type definitions
interface MyInterface {
  // ...
}

// 3. Constants
const MAX_RETRY = 3;

// 4. Classes
class MyClass {
  // ...
}

// 5. Functions
function myFunction() {
  // ...
}

// 6. Exports
export { myFunction, MyClass };
```

### Documentation

#### JSDoc Comments

All public functions, classes, and interfaces should have JSDoc comments:

```typescript
/**
 * Brief description of the function.
 * 
 * More detailed explanation if needed. Can include multiple
 * paragraphs, usage notes, or implementation details.
 * 
 * @param paramName - Description of parameter
 * @param anotherParam - Another parameter description
 * @returns Description of return value
 * 
 * @throws ErrorType - When this error occurs
 * 
 * @example
 * ```typescript
 * const result = myFunction('example', 42);
 * console.log(result);
 * ```
 * 
 * @see {@link RelatedFunction} for related functionality
 */
function myFunction(paramName: string, anotherParam: number): boolean {
  // Implementation
}
```

#### Inline Comments

Use inline comments for complex logic:

```typescript
// Check if frame matches any existing node to avoid duplicates
const overlappedNode = findNodeInChildren(currentNode, frame);
```

### Error Handling

Always provide meaningful error messages:

```typescript
// ❌ Bad
vscode.window.showErrorMessage("Error");

// ✅ Good
vscode.window.showErrorMessage(
  "Failed to capture call stack: No active debug session found. " +
  "Please start a debug session and try again."
);
```

### Testing

#### Write Tests For

- Core business logic
- Edge cases
- Error conditions
- Integration with VS Code API

#### Test Structure

```typescript
suite('Extension Test Suite', () => {
  test('Should capture call stack successfully', async () => {
    // Arrange
    const mockSession = createMockDebugSession();
    
    // Act
    const result = await recordCallStackInfo(mockSession, rootNode);
    
    // Assert
    assert.strictEqual(result.children.length, expectedLength);
  });
});
```

## 🐛 Reporting Bugs

### Before Submitting

1. **Search existing issues** to avoid duplicates
2. **Verify the bug** with the latest version
3. **Check if it's already fixed** in the main branch

### Bug Report Template

Use this template when creating issues:

```markdown
**Description**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Open project '...'
2. Start debug session '...'
3. Run command '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., Windows 10, macOS 12.0, Ubuntu 20.04]
- VS Code Version: [e.g., 1.85.0]
- Extension Version: [e.g., 0.0.6]
- Debugger: [e.g., Node.js, Python]

**Additional Context**
Any other relevant information.
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem. Ex. I'm frustrated when [...]

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Mockups, examples, or relevant information.

**Would you be willing to implement this feature?**
Yes/No
```

## 🔍 Pull Request Process

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows the project's style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Documentation is updated (if applicable)
- [ ] Commit messages are clear and descriptive
- [ ] PR description explains what and why
- [ ] Screenshots added (for UI changes)
- [ ] Tested manually in VS Code

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally

## Screenshots (if applicable)
```

### Review Process

1. **Automated Checks**: CI/CD will run tests and linters
2. **Code Review**: Maintainers will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged
5. **Release**: Changes will be included in the next release

## 🚀 Release Process

Maintainers follow this process for releases:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v0.0.7`
4. Push tag: `git push origin v0.0.7`
5. Package extension: `vsce package`
6. Publish to marketplace: `vsce publish`

## 📚 Resources

### Learning Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [PlantUML Documentation](https://plantuml.com/)

### Project Documentation

- [README.md](README.md) - User documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - Code architecture
- [CHANGELOG.md](CHANGELOG.md) - Version history

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions
- No harassment or discrimination

### Communication

- **GitHub Issues**: Bug reports, feature requests
- **Pull Requests**: Code contributions, discussions
- **Discussions**: General questions, ideas

## ❓ Questions?

If you have questions:

1. Check the [README.md](README.md)
2. Search [existing issues](https://github.com/JianpingCAI/call-stack-to-plantuml/issues)
3. Create a new issue with the "question" label

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Call Stack to PlantUML!** 🎉

Your contributions help make debugging and code visualization better for everyone.
