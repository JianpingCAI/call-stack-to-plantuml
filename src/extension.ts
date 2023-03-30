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

function callStackToPlantUML_v1(callStack: DebugProtocol.StackFrame[]): string {
  let plantUMLScript = "@startuml\n";
  plantUMLScript += "start\n";

  // Reverse the order of the callStack array
  const reversedCallStack = callStack.slice().reverse();

  for (const frame of reversedCallStack) {
    plantUMLScript += `:${frame.name};\n`;
  }

  plantUMLScript += "stop\n";
  plantUMLScript += "@enduml";

  return plantUMLScript;
}

function callStackToPlantUML(callStack: DebugProtocol.StackFrame[]): string {
  // Reverse the order of the callStack array
  const reversedCallStack = callStack.slice().reverse();

  // Group the frames by package
  const framesByPackage = reversedCallStack.reduce((groups, frame) => {
    const packageName =
      frame.source?.path?.split("/").slice(0, -1).join("/") || "Unknown";
    if (!groups[packageName]) {
      groups[packageName] = [];
    }
    groups[packageName].push(frame);
    return groups;
  }, {} as Record<string, DebugProtocol.StackFrame[]>);

  let plantUMLScript = "@startuml\n";
  plantUMLScript += "start\n";

  for (const packageName in framesByPackage) {
    plantUMLScript += `partition ${packageName} {\n`;
    for (const frame of framesByPackage[packageName]) {
      plantUMLScript += `  :${frame.name};\n`;
    }
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
export function deactivate() {}
