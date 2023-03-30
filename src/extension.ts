// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { DebugProtocol } from "vscode-debugprotocol";

async function getCallStackInfo(
  session: vscode.DebugSession
): Promise<DebugProtocol.StackFrame[]> {
  const callStack: DebugProtocol.StackFrame[] = [];

  const threadsResponse = await session.customRequest("threads");
  const threadId = threadsResponse.threads[0].id;
  const stackTraceResponse = await session.customRequest("stackTrace", {
    threadId,
  });

  callStack.push(...stackTraceResponse.stackFrames);

  return callStack;
}

function callStackToPlantUML(callStack: DebugProtocol.StackFrame[]): string {
  let plantUMLScript = "@startuml\n";
  plantUMLScript += "start\n";

  for (const frame of callStack) {
    plantUMLScript += `:${frame.name};\n`;
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
