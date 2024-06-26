// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { config } from "process";

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

  vscode.commands.registerCommand(
    "extension.runItInQemu",
    async (uri: vscode.Uri) => {
      processCommand(uri, "runItInQemu");
    }
  );

  vscode.commands.registerCommand(
    "extension.generateClipboard",
    async (uri: vscode.Uri) => {
      processCommand(uri, "generateClipboard");
    }
  );

  vscode.commands.registerCommand(
    "extension.extraCommand1",
    async (uri: vscode.Uri) => {
      processCommand(uri, "extraCommand1");
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function extractStringsFromCurlyBraces(input: string): string[] {
  const regex = /\${([^}]+)}/g;
  const matches = input.match(regex);

  if (matches) {
    return matches.map((match) => {
      // Remove the curly braces from the matched string
      return match.slice(2, -1);
    });
  }

  return [];
}

async function processCommand(uri: vscode.Uri, command: string) {
  let itemAbsString: string;
  let itemRelString: string;

  if (uri) {
    try {
      // Get the string of the clicked item
      itemAbsString = uri.fsPath.replaceAll("\\", "/");
      itemRelString = path.basename(uri.fsPath).replaceAll("\\", "/");
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to get item information ${error}`);
    }
  } else {
    vscode.window.showErrorMessage(`undefined ${uri}`);
  }

  // Get the configuration for the current workspace
  // Access the extension-specific variable from the user settings
  let jsonFilePath = vscode.workspace.getConfiguration("swotide.jsonFile");
  let jsonFilePathStrUn: string | undefined;
  let jsonFilePathStr: string;
  let cmdCommand = vscode.workspace.getConfiguration("swotide."+command);

  if (!jsonFilePath) {
    vscode.window.showErrorMessage(
      "SwotIDE: Json file path is not found! (swotide.jsonFile)"
    );
    return;
  }

  if (!cmdCommand) {
    vscode.window.showErrorMessage(
      "SwotIDE: Command is not found! ("+command+""
    );
    return;
  }

  // Use the retrieved variable
  console.log(jsonFilePath);
  console.log(cmdCommand);

  if ("darwin" === process.platform) {
    jsonFilePathStrUn = jsonFilePath.get<string>("macos");
  } else if ("linux" === process.platform) {
    jsonFilePathStrUn = jsonFilePath.get<string>("linux");
  } else if ("win32" === process.platform) {
    jsonFilePathStrUn = jsonFilePath.get<string>("windows");
  } else {
    vscode.window.showErrorMessage(
      "SwotIDE: Invalid platform! (windows, linux, macos)"
    );
    return;
  }

  if (!jsonFilePathStrUn) {
    vscode.window.showErrorMessage(
      "SwotIDE: Json file is not found for " +
        process.platform +
        "! (swotide.jsonFile)"
    );
    return;
  }
  else
  {
    jsonFilePathStr = jsonFilePathStrUn;
  }

  let newCleanBuildCommand: string | undefined;
  let newCleanBuildCommandStr: string;

  if ("darwin" === process.platform) {
    newCleanBuildCommand = cmdCommand.get<string>("macos");
  } else if ("linux" === process.platform) {
    newCleanBuildCommand = cmdCommand.get<string>("linux");
  } else if ("win32" === process.platform) {
    newCleanBuildCommand = cmdCommand.get<string>("windows");
  } else {
    vscode.window.showErrorMessage(
      "SwotIDE: Invalid platform! (windows, linux, macos)"
    );
    return;
  }

  if (!newCleanBuildCommand) {
    vscode.window.showErrorMessage(
      "SwotIDE: Valid command ("+command+") is not defined for " + process.platform.toString()
    );
    return;
  }
  else
  {
    newCleanBuildCommandStr = newCleanBuildCommand;
  }

  fs.readFile(jsonFilePathStr.toString(), "utf-8", (err, data) => {
    if (err) {
      vscode.window.showErrorMessage(
        `SwotIDE: Failed to read JSON file: ${err}`
      );
      return;
    }

    // Parse the JSON data
    try {
      const jsonData = JSON.parse(data);

      const extractedStrings =
        extractStringsFromCurlyBraces(newCleanBuildCommandStr);
      console.log(extractedStrings);

      for (const elem of extractedStrings) {
        if (elem === "clicked_abs_path") {
          newCleanBuildCommandStr = newCleanBuildCommandStr.replace(
            "${" + elem + "}",
            itemAbsString
          );
        } else if (elem === "clicked_rel_path") {
          newCleanBuildCommandStr = newCleanBuildCommandStr.replace(
            "${" + elem + "}",
            itemRelString
          );
        } else if (elem === "json_file_path") {
          newCleanBuildCommandStr = newCleanBuildCommandStr.replace(
            "${" + elem + "}",
            jsonFilePathStr
          );
        } else if (elem.includes("config:")) {
          var propertyPath = elem;
          propertyPath = propertyPath.replace("config:", "");
          const pathParts = propertyPath.split(".");

          let configData = vscode.workspace
            .getConfiguration()
            .get(propertyPath);

          if (configData) {
            let result: string = configData.toString();

            newCleanBuildCommandStr = newCleanBuildCommandStr.replace(
              "${" + elem + "}",
              result
            );
          }
        } else if (elem.includes("json:")) {
          var propertyPath = elem;
          propertyPath = propertyPath.replace("json:", "");
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
          newCleanBuildCommandStr = newCleanBuildCommandStr.replace(
            "${" + elem + "}",
            result
          );
        }
        console.log(elem);
      }
      console.log(newCleanBuildCommandStr);

      // Create a new terminal
      const terminal = vscode.window.createTerminal("SwotIDE Terminal");

      // Send the command to the terminal
      terminal.sendText(newCleanBuildCommandStr);

      // Show the terminal
      terminal.show();
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to parse JSON file: ${err}`);
    }
  });
}
