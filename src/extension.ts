// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { DebugProtocol } from "vscode-debugprotocol";

// Add this new type above the getCallStackInfo function
type ThreadQuickPickItem = {
  label: string;
  description: string;
  thread: DebugProtocol.Thread;
};

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

// function getRelativePath(absolutePath: string): string {
//   const workspaceFolders = vscode.workspace.workspaceFolders;
//   if (!workspaceFolders) {
//     return absolutePath;
//   }

//   for (const wsFolder of workspaceFolders) {
//     const folderPath = wsFolder.uri.fsPath;
//     if (absolutePath.startsWith(folderPath)) {
//       return absolutePath.slice(folderPath.length + 1);
//     }
//   }

//   return absolutePath;
// }

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

function callStackToPlantUML(callStack: DebugProtocol.StackFrame[]): string {
  // Reverse the order of the callStack array
  const reversedCallStack = callStack.slice().reverse();

  let plantUMLScript = "@startuml\n";
  plantUMLScript += "start\n";

  let currentPackage: string | null = null;

  for (const frame of reversedCallStack) {
    const absolutePath = frame.source?.path || "";
    // const packageName 
    //   vscode.workspace.asRelativePath(
    //     absolutePath.split("/").slice(0, -1).join("/")
    //   ) || "Unknown";
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
