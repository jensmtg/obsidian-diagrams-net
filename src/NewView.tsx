import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { NewComponent } from "./NewComponent";

export const VIEW_TYPE_NEW = "new-view";

export class NewView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_NEW;
  }

  getDisplayText() {
    return "New Diagram";
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    ReactDOM.render(
      <NewComponent app={this.app} close={this.onClose} />,
      container
    );
  }

  async onClose() {
    ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
  }
}