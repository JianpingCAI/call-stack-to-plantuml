# Code Improvement Plan

This document tracks the code quality improvements for the Call Stack to PlantUML extension.

**Branch**: `refactor/code-quality-improvements`  
**Started**: January 30, 2026  
**Status**: In Progress

---

## 📊 Progress Overview

**Completed**: 3/10 tasks  
**In Progress**: 0/10 tasks  
**Remaining**: 7/10 tasks

---

## ✅ Completed Tasks

### 1. Remove unused mergeSpaces function

- **Status**: ✅ Completed
- **Priority**: High
- **Commit**: `10aa810`
- **Description**: Removed the `mergeSpaces` function that was never called anywhere in the codebase
- **Benefits**: Reduces dead code and improves maintainability
- **Changes**: Deleted 22 lines of unused code

### 2. Rename autoWordWrap2 to autoWordWrap

- **Status**: ✅ Completed
- **Priority**: High
- **Commit**: `4e286c9`
- **Description**: Removed the confusing "2" suffix from the function name
- **Benefits**: Improves code clarity and removes confusion about versioning
- **Changes**: Renamed function definition and updated 3 references (1 call site + 2 JSDoc examples)

### 3. Remove commented partition/package code

- **Status**: ✅ Completed
- **Priority**: High
- **Commit**: Pending
- **Description**: Cleaned up commented code in `callStackToPlantUML` function
- **Benefits**: Removes dead code and improves code readability
- **Changes**: Removed 7 lines of commented-out partition/package feature code

---

## 🔴 High Priority - Code Quality

### 4. Add try-catch error handling for customRequest calls

- **Status**: ⏳ Not Started
- **Priority**: High
- **Estimated Effort**: Medium (30 min)
- **Description**: Wrap debug protocol requests in try-catch blocks for better error handling
- **Locations**:
  - `recordCallStackInfo()` - threads request
  - `recordCallStackInfo()` - stackTrace request
- **Benefits**: Graceful error handling, better user experience
- **Error Messages**: Should be clear and actionable

---

## 🟡 Medium Priority - Robustness

### 5. Improve word wrapping edge cases

- **Status**: ⏳ Not Started
- **Priority**: Medium
- **Estimated Effort**: Medium (45 min)
- **Description**: Handle words longer than maxLength in `autoWordWrap` function
- **Current Issue**: Very long words (e.g., long namespaces) don't wrap properly
- **Proposed Solution**:
  - Add hyphenation for words exceeding maxLength
  - Or truncate with ellipsis
  - Or allow overflow with warning
- **Edge Cases to Handle**:
  - Single word longer than maxLength
  - Multiple consecutive long words
  - Special characters in long words

---

## 🧪 Testing

### 6. Add unit tests for areFramesEqual function

- **Status**: ⏳ Not Started
- **Priority**: Medium
- **Estimated Effort**: Small (20 min)
- **Description**: Test frame comparison logic
- **Test Cases**:
  - Identical frames return true
  - Different names return false
  - Different paths return false
  - Different line numbers return false
  - Different column numbers return false
  - Missing source paths handled correctly

### 7. Add unit tests for findNodeInChildren function

- **Status**: ⏳ Not Started
- **Priority**: Medium
- **Estimated Effort**: Medium (30 min)
- **Description**: Test tree search functionality
- **Test Cases**:
  - Find node at root level
  - Find node in deep tree
  - Return null when not found
  - Handle empty tree
  - Handle single node tree

### 8. Add unit tests for callStackToPlantUML function

- **Status**: ⏳ Not Started
- **Priority**: Medium
- **Estimated Effort**: Medium (45 min)
- **Description**: Test PlantUML generation
- **Test Cases**:
  - Generate for linear call stack
  - Generate for branching call stack
  - Handle empty tree
  - Handle single node
  - Verify split/merge syntax
  - Test word wrapping integration

### 9. Add integration tests for recordCallStackInfo

- **Status**: ⏳ Not Started
- **Priority**: Low
- **Estimated Effort**: Large (60 min)
- **Description**: Test full call stack recording flow
- **Challenges**: Requires mocking debug session
- **Test Cases**:
  - Record single call stack
  - Merge overlapping call stacks
  - Handle non-overlapping call stacks
  - Handle thread selection
  - Handle no threads available

---

## 🏗️ Architecture

### 10. Refactor state management into a class

- **Status**: ⏳ Not Started
- **Priority**: Low
- **Estimated Effort**: Large (90 min)
- **Description**: Move from closure-based state to proper class
- **Proposed Design**:

  ```typescript
  class CallStackTreeManager {
    private rootNode: StackFrameNode;
    
    constructor() {
      this.rootNode = new StackFrameNode({...});
    }
    
    async recordCallStack(session: vscode.DebugSession): Promise<void>
    reset(): void
    toPlantUML(maxLength: number): string
  }
  ```

- **Benefits**:
  - Better testability (injectable state)
  - Clearer encapsulation
  - Easier to extend
  - Could enable persistence in future
- **Challenges**: Large refactoring, affects all commands

---

## 📝 Notes

### Design Decisions Needed

1. **Partition Feature** (Task 3): Should we implement or remove the commented partition code that groups functions by package?
   - Pros of implementing: Better organized diagrams
   - Cons: More complex PlantUML, may not work well with all code styles

2. **Column Comparison** (Task 6): Is comparing column numbers in `areFramesEqual` too strict?
   - May cause issues with minified code
   - Consider making column comparison optional

3. **Word Wrapping Strategy** (Task 5): How to handle very long words?
   - Option A: Hyphenate (requires choosing break points)
   - Option B: Truncate with ellipsis (loses information)
   - Option C: Allow overflow (may break diagram layout)

### Future Enhancements (Not in Current Scope)

- Export to multiple formats (SVG, PNG, JSON)
- Frame filtering (hide framework code)
- Custom PlantUML themes
- Persistence of call stack trees
- Diff view for comparing execution paths

---

## 🎯 Success Criteria

This improvement plan will be considered complete when:

- [ ] All 10 tasks are completed
- [ ] All tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Extension compiles without errors (`npm run compile`)
- [ ] Manual testing shows no regressions
- [ ] Documentation is updated if needed
- [ ] All commits follow commit message conventions

---

## 📚 Related Documents

- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [CHANGELOG.md](CHANGELOG.md) - Version history

---

**Last Updated**: January 30, 2026
