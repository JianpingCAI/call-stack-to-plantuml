// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";
import { DebugProtocol } from "vscode-debugprotocol";

/**
 * Represents a node in the call stack tree structure.
 * 
 * This class is used to build a tree representation of call stacks captured
 * from debug sessions. Each node contains a stack frame and can have multiple
 * children representing nested function calls.
 * 
 * @example
 * ```typescript
 * const rootNode = new StackFrameNode({ id: -1, name: 'Root' } as DebugProtocol.StackFrame);
 * const childNode = new StackFrameNode({ id: 0, name: 'main' } as DebugProtocol.StackFrame);
 * rootNode.children.push(childNode);
 * ```
 */
class StackFrameNode {
  /** The debug protocol stack frame associated with this node */
  frame: DebugProtocol.StackFrame;

  /** Child nodes representing nested function calls */
  children: StackFrameNode[];

  constructor(frame: DebugProtocol.StackFrame) {
    this.frame = frame;
    this.children = [];
  }
}

type ThreadQuickPickItem = {
  label: string;
  description: string;
  thread: DebugProtocol.Thread;
};

/**
 * Compares two stack frames for equality based on name, source path, line, and column.
 * 
 * Two frames are considered equal if they represent the same function call at the same
 * location in the source code. This is used to detect overlapping call stacks when
 * merging multiple recorded stacks.
 * 
 * @param frame1 - The first stack frame to compare
 * @param frame2 - The second stack frame to compare
 * @returns `true` if the frames are equal, `false` otherwise
 * 
 * @example
 * ```typescript
 * const frame1 = { name: 'foo', source: { path: '/src/app.ts' }, line: 10, column: 5 };
 * const frame2 = { name: 'foo', source: { path: '/src/app.ts' }, line: 10, column: 5 };
 * areFramesEqual(frame1, frame2); // returns true
 * ```
 */
function areFramesEqual(
  frame1: DebugProtocol.StackFrame,
  frame2: DebugProtocol.StackFrame
): boolean {
  return (
    frame1.name === frame2.name &&
    frame1.source?.path === frame2.source?.path &&
    frame1.line === frame2.line &&
    frame1.column === frame2.column
  );
}

/**
 * Recursively searches for a node in the call stack tree that matches the given frame.
 * 
 * This function performs a depth-first search through the tree to find a node whose
 * frame is equal to the provided frame (using `areFramesEqual`).
 * 
 * @param node - The node to start searching from (typically the root or a subtree root)
 * @param frame - The stack frame to search for
 * @returns The matching `StackFrameNode` if found, or `null` if not found
 * 
 * @example
 * ```typescript
 * const foundNode = findNodeInChildren(rootNode, targetFrame);
 * if (foundNode) {
 *   console.log('Found frame:', foundNode.frame.name);
 * }
 * ```
 */
function findNodeInChildren(
  node: StackFrameNode,
  frame: DebugProtocol.StackFrame
): StackFrameNode | null {
  if (node.frame && areFramesEqual(node.frame, frame)) {
    return node;
  }

  for (const child of node.children) {
    const foundNode = findNodeInChildren(child, frame);
    if (foundNode) {
      return foundNode;
    }
  }

  return null;
}

/**
 * Records call stack information from the active debug session and merges it into the call stack tree.
 * 
 * This function:
 * 1. Retrieves available threads from the debug session
 * 2. Prompts the user to select a thread
 * 3. Fetches the stack trace for the selected thread
 * 4. Intelligently merges the new stack trace with existing recorded stacks
 * 5. Avoids duplicating overlapping portions of the call stack
 * 
 * The merging algorithm identifies common prefixes between the new call stack and existing
 * branches in the tree, then appends only the non-overlapping frames.
 * 
 * @param session - The active VS Code debug session
 * @param treeRootNode - The root node of the call stack tree to update
 * @returns A promise that resolves to the updated root node
 * 
 * @throws Shows error message if no threads are available
 * 
 * @example
 * ```typescript
 * const session = vscode.debug.activeDebugSession;
 * if (session) {
 *   await recordCallStackInfo(session, rootNode);
 * }
 * ```
 */
async function recordCallStackInfo(
  session: vscode.DebugSession,
  treeRootNode: StackFrameNode
): Promise<StackFrameNode> {
  const callStack: DebugProtocol.StackFrame[] = [];

  const threadsResponse = await session.customRequest("threads");

  // Check if there are threads
  if (!threadsResponse.threads || threadsResponse.threads.length === 0) {
    vscode.window.showErrorMessage("No threads available.");
    return treeRootNode;
  }

  // Prompt the user to select a thread
  const selectedThread = await vscode.window.showQuickPick<ThreadQuickPickItem>(
    threadsResponse.threads.map((thread: DebugProtocol.Thread) => ({
      label: thread.name,
      description: `Thread ID: ${thread.id}`,
      thread,
    })),
    { placeHolder: "Select a thread" }
  );

  // Check if the user selected a thread
  if (!selectedThread) {
    vscode.window.showInformationMessage("No thread selected.");
    return treeRootNode;
  }

  const threadId = selectedThread.thread.id;
  // Get the call stack of the selected thread
  const stackTraceResponse = await session.customRequest("stackTrace", {
    threadId,
  });

  callStack.push(...stackTraceResponse.stackFrames);
  callStack.reverse();

  // Insert the CallFrames of callStack to the tree
  let currentNode = treeRootNode;
  let overlappedNode: StackFrameNode | null = null;
  let currentFrame = callStack[0];
  let hasOverlap = false;

  for (const frame of callStack) {
    overlappedNode = findNodeInChildren(currentNode, frame);

    if (overlappedNode) {
      currentNode = overlappedNode;
      currentFrame = frame;
      hasOverlap = true;
    } else {
      break;
    }
  }

  // Remove the overlapping frames from the callStack
  let nonOverlappingFrames = null;
  if (!hasOverlap) {
    nonOverlappingFrames = callStack;
  } else {
    nonOverlappingFrames = callStack.slice(callStack.indexOf(currentFrame) + 1);
  }

  // Add the non-overlapping frames to the tree
  for (const frame of nonOverlappingFrames) {
    const newNode: StackFrameNode = { frame, children: [] };
    currentNode.children.push(newNode);
    currentNode = newNode;
  }

  return treeRootNode;
}

/**
 * Converts an absolute file path to a workspace-relative path.
 * 
 * If the file is within one of the workspace folders, returns the relative path.
 * Otherwise, returns the original absolute path.
 * 
 * @param absolutePath - The absolute file system path to convert
 * @returns The workspace-relative path if applicable, otherwise the absolute path
 * 
 * @example
 * ```typescript
 * // If workspace is at /home/user/project
 * getRelativePath('/home/user/project/src/app.ts');  // returns 'src/app.ts'
 * getRelativePath('/usr/lib/external.ts');           // returns '/usr/lib/external.ts'
 * ```
 */
function getRelativePath(absolutePath: string): string {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return absolutePath;
  }

  const fileUri = vscode.Uri.file(absolutePath);

  for (const folder of workspaceFolders) {
    const folderUri = folder.uri;
    if (fileUri.path.startsWith(folderUri.path)) {
      return vscode.workspace.asRelativePath(fileUri, false);
    }
  }

  return absolutePath;
}

/**
 * Wraps a long line of text into multiple lines based on a maximum length.
 * 
 * The function splits text by spaces and constructs lines that don't exceed the
 * specified maximum length. Special handling is applied to segments starting with
 * an asterisk (adding indentation).
 * 
 * @param line - The text line to wrap
 * @param maxLength - Maximum length for each wrapped line (default: 60)
 * @returns An array of wrapped text lines
 * 
 * @example
 * ```typescript
 * const wrapped = autoWordWrap('This is a very long function name that needs wrapping', 30);
 * // Returns: ['This is a very long function', 'name that needs wrapping']
 * ```
 */
function autoWordWrap(line: string, maxLength: number = 60): string[] {
  let wrappedLines: string[] = [];
  let currentLine = "";

  const lineSegments = line.trim().split(" ");
  for (let i = 0; i < lineSegments.length; i++) {
    const segment = lineSegments[i];

    // If the segment can fit in the current line
    if (currentLine.length + segment.length + 1 <= maxLength) {
      currentLine += segment + " ";
    }
    // If the segment is too long to fit in the current line
    else {
      if (currentLine.length > 0) {
        wrappedLines.push(currentLine);
      }
      currentLine = segment.startsWith("*") ? " " + segment : segment;
    }
  }

  if (currentLine.length > 0) {
    wrappedLines.push(currentLine.trimEnd());
  }

  return wrappedLines;
}

/**
 * Converts the call stack tree to a PlantUML Activity Diagram script.
 * 
 * This function traverses the call stack tree and generates PlantUML syntax that represents
 * the execution flow. When a node has multiple children, it uses PlantUML's split/split again
 * syntax to show parallel or alternative execution paths.
 * 
 * The generated diagram includes:
 * - Start and stop nodes
 * - Activity nodes for each function call (with word-wrapped names)
 * - Split/merge constructs for branching execution paths
 * 
 * @param rootStackFrameNode - The root node of the call stack tree
 * @param maxLength - Maximum line length for function names before wrapping (default: 60)
 * @returns A complete PlantUML script string ready to render
 * 
 * @example
 * ```typescript
 * const plantUML = callStackToPlantUML(rootNode, 60);
 * // Returns:
 * // @startuml
 * // start
 * // :main;
 * // :processData;
 * // stop
 * // @enduml
 * ```
 * 
 * @see {@link https://plantuml.com/activity-diagram-beta|PlantUML Activity Diagram Documentation}
 */
function callStackToPlantUML(
  rootStackFrameNode: StackFrameNode,
  maxLength: number = 60
): string {
  let plantUMLScript = "@startuml\n";
  plantUMLScript += "start\n";

  function traverseNode(node: StackFrameNode) {
    for (const [index, child] of node.children.entries()) {
      if (index === 0 && node.children.length > 1) {
        plantUMLScript += "\nsplit\n\n";
      } else if (index > 0) {
        plantUMLScript += "\nsplit again\n\n";
      }

      const wrappedLines: string[] = autoWordWrap(child.frame.name, maxLength);
      const jointLine = wrappedLines.join("\n");
      plantUMLScript += `:${jointLine};\n`;

      traverseNode(child);
    }

    if (node.children.length > 1) {
      plantUMLScript += "\nend split\n\n";
    }
  }

  traverseNode(rootStackFrameNode);

  plantUMLScript += "stop\n";
  plantUMLScript += "@enduml";

  return plantUMLScript;
}

/**
 * Retrieves the maximum line length configuration for PlantUML diagrams.
 * 
 * This function reads the user's configuration setting for maximum line length,
 * which controls when function names are wrapped in the generated PlantUML diagrams.
 * 
 * @returns The configured maximum line length (default: 60)
 * 
 * @example
 * ```typescript
 * const maxLen = getMaxLength();
 * const wrapped = autoWordWrap(functionName, maxLen);
 * ```
 * 
 * @see Configuration key: `call-stack-to-plantuml.maxLength`
 */
function getMaxLength(): number {
  return vscode.workspace
    .getConfiguration()
    .get("call-stack-to-plantuml.maxLength", 60);
}

/**
 * Generates a PlantUML Activity Diagram from the call stack tree and copies it to the clipboard.
 * 
 * This function:
 * 1. Verifies an active debug session exists
 * 2. Retrieves the maximum line length from configuration
 * 3. Converts the call stack tree to PlantUML syntax
 * 4. Copies the generated script to the system clipboard
 * 5. Shows a confirmation message to the user
 * 
 * @param rootStackFrameNode - The root node of the call stack tree to convert
 * @returns A promise that resolves when the operation is complete
 * 
 * @throws Shows error message if no active debug session is found
 * 
 * @example
 * ```typescript
 * await copyCallStackToPlantUML(rootNode);
 * // User can now paste the PlantUML script into an editor
 * ```
 */
async function copyCallStackToPlantUML(rootStackFrameNode: StackFrameNode) {
  // Check if there is an active debug session
  const session = vscode.debug.activeDebugSession;
  if (!session) {
    vscode.window.showErrorMessage("No active debug session found.");
    return;
  }

  // Auto word wrap the PlantUML script
  const maxLength = getMaxLength();

  // Convert call stack tree to PlantUML
  const plantUMLScript = callStackToPlantUML(rootStackFrameNode, maxLength);

  // Copy the PlantUML script to the clipboard
  vscode.env.clipboard.writeText(plantUMLScript).then(() => {
    vscode.window.showInformationMessage(
      "PlantUML Activity diagram script copied to clipboard."
    );
  });
}

/**
 * Resets the call stack tree by clearing all recorded call stacks.
 * 
 * This function removes all children from the root node, effectively clearing
 * all previously recorded call stack information. It's automatically called when
 * a new debug session starts, or can be manually triggered by the user.
 * 
 * @param rootStackFrameNode - The root node of the call stack tree to reset
 * 
 * @example
 * ```typescript
 * resetCallStackTree(rootNode);
 * // rootNode.children is now empty
 * ```
 */
function resetCallStackTree(rootStackFrameNode: StackFrameNode) {
  rootStackFrameNode.children = [];
  vscode.window.showInformationMessage("Call stack tree has been reset.");
}

/**
 * Activates the Call Stack to PlantUML extension.
 * 
 * This function is called by VS Code when the extension is first activated.
 * It performs the following initialization:
 * 
 * 1. Creates the root node for the call stack tree
 * 2. Registers three commands:
 *    - `extension.recordCallStack`: Records the current call stack
 *    - `extension.copyCallStackToPlantUML`: Records and copies call stack as PlantUML
 *    - `extension.resetCallStackTree`: Clears all recorded call stacks
 * 3. Sets up an event listener to auto-reset the tree when debug sessions start
 * 
 * @param context - The extension context provided by VS Code
 * 
 * @remarks
 * The extension uses a persistent tree structure to accumulate multiple call stacks
 * from different breakpoints, allowing users to visualize complex execution flows.
 * 
 * @see {@link https://code.visualstudio.com/api/references/vscode-api#ExtensionContext|VS Code Extension Context}
 */
export function activate(context: vscode.ExtensionContext) {
  // Create the root node of the call stack tree
  const rootStackFrameNode = new StackFrameNode({
    id: -1,
    name: "Root",
  } as DebugProtocol.StackFrame);

  // Register the recordCallStack command
  let getCallStackDisposable = vscode.commands.registerCommand(
    "extension.recordCallStack",
    async () => {
      const session = vscode.debug.activeDebugSession;
      if (!session) {
        vscode.window.showErrorMessage("No active debug session found.");
        return;
      }

      await recordCallStackInfo(session, rootStackFrameNode);
      vscode.window.showInformationMessage("Call stack has been recorded.");
    }
  );
  context.subscriptions.push(getCallStackDisposable);

  // Register the copyCallStackToPlantUML command
  let disposable = vscode.commands.registerCommand(
    "extension.copyCallStackToPlantUML",
    async () => {
      const session = vscode.debug.activeDebugSession;
      if (!session) {
        vscode.window.showErrorMessage("No active debug session found.");
        return;
      }

      await recordCallStackInfo(session, rootStackFrameNode);
      await copyCallStackToPlantUML(rootStackFrameNode);
    }
  );
  context.subscriptions.push(disposable);

  // Register the resetCallStackTree command
  let disposableResetCallStackTree = vscode.commands.registerCommand(
    "extension.resetCallStackTree",
    () => {
      resetCallStackTree(rootStackFrameNode);
    }
  );
  context.subscriptions.push(disposableResetCallStackTree);

  // Reset the call stack tree when a new debug session starts
  context.subscriptions.push(
    vscode.debug.onDidStartDebugSession(() => {
      resetCallStackTree(rootStackFrameNode);
    })
  );
}

/**
 * Deactivates the Call Stack to PlantUML extension.
 * 
 * This function is called by VS Code when the extension is deactivated.
 * Currently, no cleanup is required as the extension doesn't maintain any
 * resources that need explicit disposal.
 * 
 * @remarks
 * All registered commands and event listeners are automatically cleaned up
 * by VS Code when the extension context is disposed.
 */
export function deactivate() { }
