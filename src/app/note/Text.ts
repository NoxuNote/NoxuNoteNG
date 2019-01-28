import { INoteStructureElement } from "./INoteStructureElement";
import { contentTracing } from "electron";

export abstract class Text implements INoteStructureElement {
  rawContent(): string {
    return "NOT IMPLEMENTED";
  }
  isEditable: boolean;
  onClick() {
    throw new Error("Method not implemented.");
  }
  content: string;

  setContent(content: string) {
    this.content = content;
  }
}