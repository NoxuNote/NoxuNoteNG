export interface INoteStructureElement {
  isEditable: boolean;
  onClick();
  rawContent(): string;
}