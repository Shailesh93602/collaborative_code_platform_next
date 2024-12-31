export interface ListItem {
  id: string;
  name: string;
}

export interface SortableListProps {
  readonly items: ListItem[];
  readonly dictionary: any;
  readonly lang: 'en' | 'hi' | 'gu';
}
