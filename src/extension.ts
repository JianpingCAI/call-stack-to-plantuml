// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";
import { DebugProtocol } from "vscode-debugprotocol";

/**
 * A node in the call stack tree.
 */
class StackFrameNode {
  frame: DebugProtocol.StackFrame;
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
 * Compare two frames by their function name, source location.
 * @param frame1
 * @param frame2
 * @returns Returns true if the two frames are equal, false otherwise.
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
 * Find a node in the call stack tree.
 * @param node The root node of the call stack tree.
 * @param frame The frame to find.
 * @returns
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
 * Record the call stack information from the debug session, and add it to the call stack tree.
 * @param session The debug session
 * @param treeRootNode The root node of the call stack tree.
 * @returns
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
  let hasOverlap=false;

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
 * Get the relative path of a file.
 * @param absolutePath The absolute path of the file.
 * @returns The relative path of the file.
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
 * Convert the call stack to a PlantUML script of an Activity Diagram.
 * @param callStackFrames The call stack.
 * @returns The PlantUML script.
 */
function callStackToPlantUML(rootStackFrameNode: StackFrameNode): string {
  let plantUMLScript = "@startuml\n";
  plantUMLScript += "start\n";

  function traverseNode(node: StackFrameNode, indentLevel: number) {
    const indent = "  ".repeat(indentLevel);

    for (const [index, child] of node.children.entries()) {
      const absolutePath = child.frame.source?.path || "";
      const relativePath = getRelativePath(absolutePath);
      const packageName =
        relativePath.split("/").slice(0, -1).join("/") || "Unknown";

      if (index === 0 && node.children.length > 1) {
        plantUMLScript += `${indent}split\n`;
      } else if (index > 0) {
        plantUMLScript += `${indent}split again\n`;
      }

      // plantUMLScript += `${indent}partition ${packageName} {\n`;
      plantUMLScript += `${indent}  :${child.frame.name};\n`;
      // plantUMLScript += `${indent}}\n`;

      traverseNode(child, indentLevel + 1);
    }

    if (node.children.length > 1) {
      plantUMLScript += `${indent}end split\n`;
    }
  }

  traverseNode(rootStackFrameNode, 1);

  plantUMLScript += "stop\n";
  plantUMLScript += "@enduml";

  return plantUMLScript;
}

/**
 * Copy the PlantUML script of an Activity Diagram to the clipboard.
 * @returns A promise that resolves when the PlantUML script is copied to the clipboard.
 */
async function copyCallStackToPlantUML(rootStackFrameNode: StackFrameNode) {
  // Check if there is an active debug session
  const session = vscode.debug.activeDebugSession;
  if (!session) {
    vscode.window.showErrorMessage("No active debug session found.");
    return;
  }

  // Convert call stack tree to PlantUML
  const plantUMLScript = callStackToPlantUML(rootStackFrameNode);

  // Copy the PlantUML script to the clipboard
  vscode.env.clipboard.writeText(plantUMLScript).then(() => {
    vscode.window.showInformationMessage(
      "PlantUML Activity diagram script copied to clipboard."
    );
  });
}

/**
 * Reset the call stack tree.
 * @param rootStackFrameNode The root node of the call stack tree.
 */
function resetCallStackTree(rootStackFrameNode: StackFrameNode) {
  rootStackFrameNode.children = [];
  vscode.window.showInformationMessage("Call stack tree has been reset.");
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
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

// This method is called when your extension is deactivated
export function deactivate() {}
