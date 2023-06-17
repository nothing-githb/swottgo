// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "swottgo" is now active!');

  let disposable = vscode.commands.registerCommand(
    "extension.cleanBuild",
    async (uri: vscode.Uri) => {
      processCommand(uri, "cleanBuild");
    }
  );

  vscode.commands.registerCommand(
    "extension.changeBsp",
    async (uri: vscode.Uri) => {
      processCommand(uri, "changeBsp");
    }
  );

  vscode.commands.registerCommand(
    "extension.downloadToTarget",
    async (uri: vscode.Uri) => {
      processCommand(uri, "downloadToTarget");
    }
  );

  vscode.commands.registerCommand(
    "extension.changeBspAndCleanBuild",
    async (uri: vscode.Uri) => {
      processCommand(uri, "changeBspAndCleanBuild");
    }
  );

  vscode.commands.registerCommand(
    "extension.cleanBuildAndDownloadToTarget",
    async (uri: vscode.Uri) => {
      processCommand(uri, "cleanBuildAndDownloadToTarget");
    }
  );

  vscode.commands.registerCommand(
    "extension.changeBspAndCleanBuildAndDownloadToTarget",
    async (uri: vscode.Uri) => {
      processCommand(uri, "changeBspAndCleanBuildAndDownloadToTarget");
    }
  );

  vscode.commands.registerCommand(
    "extension.objDump",
    async (uri: vscode.Uri) => {
      processCommand(uri, "objDump");
    }
  );

  vscode.commands.registerCommand(
    "extension.selectElfForDebug",
    async (uri: vscode.Uri) => {
      processCommand(uri, "selectElfForDebug");
    }
  );

  vscode.commands.registerCommand(
    "extension.openTftp",
    async (uri: vscode.Uri) => {
      processCommand(uri, "openTftp");
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function extractStringsFromCurlyBraces(input: string): string[] {
  const regex = /{([^}]+)}/g;
  const matches = input.match(regex);

  if (matches) {
    return matches.map((match) => {
      // Remove the curly braces from the matched string
      return match.slice(1, -1);
    });
  }

  return [];
}

async function processCommand(
  uri: vscode.Uri,
  command: string
) {
  let itemAbsString: string;
  let itemRelString: string;

  if (uri) {
    try {
      // Get the string of the clicked item
      itemAbsString = uri.fsPath;
      itemRelString = path.basename(uri.fsPath);

    } catch (error) {
      vscode.window.showErrorMessage(`Failed to get item information ${error}`);
    }
  }

  // Get the configuration for the current workspace
  const configuration = vscode.workspace.getConfiguration("swotide");

  // Access the extension-specific variable from the user settings
  const jsonFilePath = configuration.get<string>("jsonFile");
  const cleanBuildCommand = configuration.get<string>(command);

  // Use the retrieved variable
  console.log(jsonFilePath);
  console.log(cleanBuildCommand);

  if (!jsonFilePath) {
    vscode.window.showErrorMessage(
      "SwotIDE: Json file is not found!(swotide.jsonFile)"
    );
    return;
  }

  if (!cleanBuildCommand) {
    vscode.window.showErrorMessage(
      "SwotIDE: Clean build command is not found!(swotide.cleanBuild)"
    );
    return;
  }

  let newCleanBuildCommand: string = cleanBuildCommand;

  fs.readFile(jsonFilePath.toString(), "utf-8", (err, data) => {
    if (err) {
      vscode.window.showErrorMessage(
        `SwotIDE: Failed to read JSON file: ${err}`
      );
      return;
    }

    // Parse the JSON data
    try {
      const jsonData = JSON.parse(data);

      const extractedStrings = extractStringsFromCurlyBraces(cleanBuildCommand);
      console.log(extractedStrings);

      for (const elem of extractedStrings) {
        if (elem === "clicked_abs_path") {
          newCleanBuildCommand = newCleanBuildCommand.replace(
            "{" + elem + "}",
            itemAbsString
          );
        } 
        else if (elem === "clicked_rel_path") {
          newCleanBuildCommand = newCleanBuildCommand.replace(
            "{" + elem + "}",
            itemRelString
          );
        }
        else {
          const propertyPath = elem;
          const pathParts = propertyPath.split(".");

          let result = jsonData;
          for (const part of pathParts) {
            if (result.hasOwnProperty(part)) {
              result = result[part];
            } else {
              result = undefined;
              break;
            }
          }
          newCleanBuildCommand = newCleanBuildCommand.replace(
            "{" + elem + "}",
            result
          );
        }
        console.log(elem);
      }
      console.log(newCleanBuildCommand);

      // Create a new terminal
      const terminal = vscode.window.createTerminal("SwotIDE Terminal");

      // Send the command to the terminal
      terminal.sendText(newCleanBuildCommand);

      // Show the terminal
      terminal.show();
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to parse JSON file: ${err}`);
    }
  });
}
