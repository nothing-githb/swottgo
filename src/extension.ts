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

  const collection = vscode.languages.createDiagnosticCollection('swot-ldra');

  vscode.commands.registerCommand(
    "extension.showLDRAResults",
    async (uri: vscode.Uri) => {

      // Get the configuration for the current workspace
      const configuration = vscode.workspace.getConfiguration("swotide");

      // Access the extension-specific variable from the user settings
      const jsonFilePath = configuration.get<string>("showLDRAResults");

      if (jsonFilePath) {
        //vscode.window.showErrorMessage(`filepath ${jsonFilePath}`);

        if (vscode.window.activeTextEditor) {
          let activeEditor = vscode.window.activeTextEditor;

          collection.delete(activeEditor.document.uri);

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

              const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
              
              if (workspaceFolder) {
                
                //vscode.window.showErrorMessage(`relpath ${path.relative(workspaceFolder.uri.fsPath, activeEditor.document.uri.fsPath)}`);
                let enrtyList: vscode.Diagnostic[] = [];

                for (const part of jsonData) {

                  //vscode.window.showErrorMessage(`file: ${path.relative(workspaceFolder.uri.fsPath, activeEditor.document.uri.fsPath)}`);
                  //vscode.window.showErrorMessage(`json: ${part['location']['path']}`);
                  let currentDoc: string = path.relative(workspaceFolder.uri.fsPath, activeEditor.document.uri.fsPath).replaceAll('\\', '/').toLocaleLowerCase();
                  let currentJsonObject: string = part['location']['path'].replaceAll('\\', '/').toLocaleLowerCase();
                  if (currentJsonObject.includes(currentDoc)) {
                    //vscode.window.showErrorMessage(`file ${part['location']['path']}`);

                    let range: vscode.Range = new vscode.Range(Number(part['location']['lines']['begin']) - 1, 0, Number(part['location']['lines']['begin']) - 1, 0);
                    
                    enrtyList.push({
                      code: {
                        value: part['fingerprint'].split(':')[0],
                        target: vscode.Uri.file('C:/LDRA_Toolsuite_C_CPP_10.1.0/Standards_info/Html/standards.htm#standard_'+part['fingerprint'].split(':')[0].split(' ')[1].toLowerCase()+part['fingerprint'].split(':')[0].split(' ')[0].toLowerCase())
                      },
                      message: part['fingerprint'],
                      range: range,
                      severity: vscode.DiagnosticSeverity.Information,
                      source: 'LDRA Static Analysis'
                    });

                  }

                }

                collection.set(activeEditor.document.uri, enrtyList);

              }
              else
              {
                vscode.window.showErrorMessage(`VsCode workspace folder is not found.`);
              }

            } catch (err) {
              vscode.window.showErrorMessage(`Failed to parse JSON file: ${err}`);
            }
          });
        }



        // 
      }

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

async function processCommand(
  uri: vscode.Uri,
  command: string
) {
  let itemAbsString: string;
  let itemRelString: string;

  if (uri) {
    try {
      // Get the string of the clicked item
      itemAbsString = uri.fsPath.replaceAll('\\', '/');
      itemRelString = path.basename(uri.fsPath).replaceAll('\\', '/');

    } catch (error) {
      vscode.window.showErrorMessage(`Failed to get item information ${error}`);
    }
  }
  else 
  {
    vscode.window.showErrorMessage(`undefined ${uri}`);
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
            "${" + elem + "}",
            itemAbsString
          );
        }
        else if (elem === "clicked_rel_path") {
          newCleanBuildCommand = newCleanBuildCommand.replace(
            "${" + elem + "}",
            itemRelString
          );
        }
        else if (elem === "json_file_path") {
          newCleanBuildCommand = newCleanBuildCommand.replace(
            "${" + elem + "}",
            jsonFilePath
          );
        }
        else if (elem.includes("config:")) {
          var propertyPath = elem;
          propertyPath = propertyPath.replace("config:", "");
          const pathParts = propertyPath.split(".");

          let configData = vscode.workspace.getConfiguration().get(propertyPath);

          if (configData)
          {
            let result : string = configData.toString();
  
            newCleanBuildCommand = newCleanBuildCommand.replace(
              "${" + elem + "}",
              result
            );
          }
        }
        else if (elem.includes("json:")) {
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
          newCleanBuildCommand = newCleanBuildCommand.replace(
            "${" + elem + "}",
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
