export interface Prompt {
  _id?: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[];
  isFavorite: boolean;
  createdAt?: string;
  updatedAt?: string;
}
