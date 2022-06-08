import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactView } from "./ReactView";

export const VIEW_TYPE_EXAMPLE = "example-view";

export class ExampleView extends ItemView {  
    constructor(leaf: WorkspaceLeaf) {    
        super(leaf);  
    }

  getViewType() {  
        return VIEW_TYPE_EXAMPLE; 
     }

  getDisplayText() {  
        return "Example view";  
    }

  async onOpen() { 
        const container = this.containerEl.children[1];  
        //    container.empty();    
        //    container.createEl("h4", { text: "Example view" }); 
        //  }
         ReactDOM.render(<ReactView 
          container={container}
          app={this.app}
          />, container);
  }

  async onClose() {   
       // Nothing to clean up. 
       ReactDOM.unmountComponentAtNode(this.containerEl.children[1]); 
    }
    }