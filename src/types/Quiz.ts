export interface Quiz {
  id: string;
  name: string;
  questions: {
    id: string;
    order: number;
    question: string;
    options: {
      id: string;
      text: string;
    }[];
    answer: string;
  }[];
}
