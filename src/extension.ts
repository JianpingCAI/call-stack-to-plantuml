// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";
import { DebugProtocol } from "vscode-debugprotocol";

type ThreadQuickPickItem = {
  label: string;
  description: string;
  thread: DebugProtocol.Thread;
};

/**
 * Get the call stack information from the debug session.
 * @param session The debug session.
 * @returns The call stack information.
 */
async function getCallStackInfo(
  session: vscode.DebugSession
): Promise<DebugProtocol.StackFrame[]> {
  const callStack: DebugProtocol.StackFrame[] = [];

  const threadsResponse = await session.customRequest("threads");

  // Check if there are threads
  if (!threadsResponse.threads || threadsResponse.threads.length === 0) {
    vscode.window.showErrorMessage("No threads available.");
    return callStack;
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
    return callStack;
  }

  const threadId = selectedThread.thread.id;
  const stackTraceResponse = await session.customRequest("stackTrace", {
    threadId,
  });

  callStack.push(...stackTraceResponse.stackFrames);

  return callStack;
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
 * @param callStack The call stack. 
 * @returns The PlantUML script. 
 */
function callStackToPlantUML(callStack: DebugProtocol.StackFrame[]): string {
  // Reverse the order of the callStack array
  const reversedCallStack = callStack.slice().reverse();

  let plantUMLScript = "@startuml\n";
  plantUMLScript += "start\n";

  let currentPackage: string | null = null;

  for (const frame of reversedCallStack) {
    const absolutePath = frame.source?.path || "";
    const relativePath = getRelativePath(absolutePath);
    const packageName = relativePath.split("/").slice(0, -1).join("/") || "Unknown";

    if (currentPackage !== packageName) {
      if (currentPackage !== null) {
        plantUMLScript += "}\n";
      }
      currentPackage = packageName;
      plantUMLScript += `partition ${packageName} {\n`;
    }

    plantUMLScript += `  :${frame.name};\n`;
  }

  if (currentPackage !== null) {
    plantUMLScript += "}\n";
  }

  plantUMLScript += "stop\n";
  plantUMLScript += "@enduml";

  return plantUMLScript;
}

/**
 * Copy the PlantUML script of an Activity Diagram to the clipboard.
 * @returns A promise that resolves when the PlantUML script is copied to the clipboard.   
 */
async function copyCallStackToPlantUML() {
  // Check if there is an active debug session
  const session = vscode.debug.activeDebugSession;
  if (!session) {
    vscode.window.showErrorMessage("No active debug session found.");
    return;
  }

  // Get the call stack information
  const callStack = await getCallStackInfo(session);

  // Convert call stack to PlantUML script
  const plantUMLScript = callStackToPlantUML(callStack);

  // Copy the PlantUML script to the clipboard
  vscode.env.clipboard.writeText(plantUMLScript).then(() => {
    vscode.window.showInformationMessage(
      "PlantUML Activity diagram script copied to clipboard."
    );
  });
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.copyCallStackToPlantUML",
    () => {
      copyCallStackToPlantUML();
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
