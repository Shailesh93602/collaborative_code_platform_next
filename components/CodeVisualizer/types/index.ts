export interface ASTNode {
  type: string;
  name?: string;
  value?: string;
  children?: ASTNode[];
}

export interface CodeVisualizerProps {
  readonly code: string;
  readonly dictionary: any;
}
