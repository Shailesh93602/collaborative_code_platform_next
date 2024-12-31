export interface WhiteboardObject {
  type: string;
  options: fabric.IObjectOptions & Record<string, any>;
}

export interface CollaborativeWhiteboardProps {
  readonly roomId: string;
  readonly dictionary: any;
}
