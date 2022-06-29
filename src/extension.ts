import * as vscode from "vscode";
import fetch from "node-fetch";
import { GitExtension } from "./types/git";
import isDescendant from "./utils/isDescendant";
import { DiffyResponse } from "./types/diffy";

const gitExtension =
  vscode.extensions.getExtension<GitExtension>("vscode.git")!.exports;

const git = gitExtension.getAPI(1);

export function activate(context: vscode.ExtensionContext) {
  console.log("Diffy is now active!");

  let disposable = vscode.commands.registerCommand(
    "diffy.shareDiff",
    async () => {
      if (!gitExtension.enabled) {
        return vscode.window.showErrorMessage(
          "Diffy: The git extension is not enabled yet. Please wait for it to load and try again."
        );
      }

      if (vscode.workspace.workspaceFolders !== undefined) {
        const wf = vscode.workspace.workspaceFolders[0].uri.fsPath;

        const repository = git.repositories.filter((r) =>
          isDescendant(r.rootUri.fsPath, wf)
        )[0];

        if (repository) {
          const diff = await repository.diff();

          if (diff.length > 0) {
            fetch("https://diffy.org/api/diff/", {
              headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ diff }),
              method: "PUT",
            })
              .then((r) => r.json() as Promise<DiffyResponse>)
              .then((r) => {
                console.log(r);

                vscode.window
                  .showInformationMessage(
                    "Diff uploaded successfully!",
                    "Copy URL",
                    "Open in browser"
                  )
                  .then(async (selection) => {
                    const diffURL = `https://diffy.org/diff/${r._sharedDiff.id}`;
                    if (selection === "Copy URL") {
                      vscode.env.clipboard.writeText(diffURL);
                    } else if (selection === "Open in browser") {
                      vscode.env.openExternal(vscode.Uri.parse(diffURL));
                    }
                  });
              });
          } else {
            vscode.window.showInformationMessage(
              "Diffy: Could not create diff. Your working tree is empty."
            );
          }
        } else {
          vscode.window
            .showErrorMessage(
              "Please initialize a Git repository before running this extension.",
              "Initialize Git Repository"
            )
            .then(
              (action) =>
                action === "Initialize Git Repository" &&
                vscode.commands.executeCommand("git.init")
            );
        }
      } else {
        vscode.window.showErrorMessage(
          "Diffy: Working folder not found, open a folder an try again"
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
