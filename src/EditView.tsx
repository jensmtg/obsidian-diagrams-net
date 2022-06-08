import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { EditComponent } from "./EditComponent";

export const VIEW_TYPE_EDIT = "edit-view";

export class EditView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_EDIT;
  }

  getDisplayText() {
    return "Edit Diagram";
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    ReactDOM.render(
      <EditComponent app={this.app} close={this.onClose} />,
      container
    );
  }

  async onClose() {
    ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
  }
}