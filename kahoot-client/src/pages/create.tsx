import { useState } from "react";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import { axios } from "../axios"
import { useHistory } from "react-router-dom";

export interface QuizItem {
  id: string;
  order: number;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  answer: string;
}

export default function Create() {

  const history = useHistory();

  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [quizName, setQuizName] = useState("");

  console.log(quiz);

  const addQuizItem = () => {
    const newQuizItemOptions = [0, 1, 2, 3].map(() => ({
      id: uuid(),
      text: "",
    }));
    const newQuizItem: QuizItem = {
      id: uuid(),
      order: quiz.length,
      question: "",
      options: newQuizItemOptions,
      answer: newQuizItemOptions[0].id,
    };
    setQuiz((quiz) => [...quiz, newQuizItem]);
  };

  const removeQuizItem = (quizItemId: string) => {
    setQuiz((quiz) => quiz.filter((quizItem) => quizItem.id !== quizItemId));
  };

  const changeQuizItemQuestion = (quizItemId: string, question: string) => {
    setQuiz((quiz) =>
      quiz.map((item) =>
        item.id === quizItemId ? { ...item, question } : item
      )
    );
  };

  const changeQuizItemAnswerText = (
    quizItemId: string,
    optionId: string,
    text: string
  ) => {
    setQuiz((quiz) =>
      quiz.map((item) =>
        item.id === quizItemId
          ? {
              ...item,
              options: item.options.map((option) =>
                option.id === optionId ? { ...option, text } : option
              ),
            }
          : item
      )
    );
  };

  const changeQuizItemAnswer = (quizItemId: string, optionId: string) => {
    setQuiz((quiz) =>
      quiz.map((item) =>
        item.id === quizItemId ? { ...item, answer: optionId } : item
      )
    );
  };

  const saveQuiz = async () => {
    const newQuiz = {
      id: uuid(),
      name: quizName,
      questions: quiz,
    }
    const { data } = await axios.post("/quiz/new", newQuiz);
    history.push("/quizzes");
  }

  const sortedQuiz = quiz.sort((a, b) => a.order - b.order);

  return (
    <Container>
      <h1>Create Kahoot Quiz</h1>
      <QuizNameInput placeholder="Quiz Name" value={quizName} onChange={(e) => setQuizName(e.target.value)} />
      {sortedQuiz.map((quizItem) => (
        <QuizItemInput
          key={quizItem.id}
          quizItem={quizItem}
          remove={removeQuizItem}
          changeQuestion={changeQuizItemQuestion}
          changeOptionTitle={changeQuizItemAnswerText}
          changeAnswer={changeQuizItemAnswer}
        />
      ))}
      <div>
        <Button onClick={addQuizItem}>Add Question</Button>
        {quiz.length >= 1 && <Button onClick={saveQuiz}>Save</Button>}
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f3f3f3;
  min-height: 100vh;
`;

const Button = styled.button`
  margin: 1rem;
  padding: 1rem 2rem;
  background-color: #213ddb;
  color: #f3f3f3;
  font-weight: bolder;
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0.25rem 0.25rem 0.5rem rgb(182, 182, 182);
  cursor: pointer;
`;



interface QuizItemInputProps {
  quizItem: QuizItem;
  remove: (quizItemId: string) => void;
  changeQuestion: (id: string, question: string) => void;
  changeOptionTitle: (id: string, optionId: string, text: string) => void;
  changeAnswer: (id: string, optionId: string) => void;
}

const QuizItemInput = ({
  quizItem,
  remove,
  changeQuestion,
  changeOptionTitle,
  changeAnswer
}: QuizItemInputProps) => {
  return (
    <QuizItemContainer>
      <QuizItemHeader>
        <Input
          value={quizItem.question}
          onChange={(e) => changeQuestion(quizItem.id, e.target.value)}
          placeholder={`Question ${quizItem.order + 1}`}
        />
        <RemoveButton onClick={() => remove(quizItem.id)}>Remove</RemoveButton>
      </QuizItemHeader>
      <QuizItemOptionsContainer>
        {quizItem.options.map((option, index) => (
          <ListItem key={option.id}>
            <CheckBox type="checkbox" checked={quizItem.answer === option.id} onChange={() => changeAnswer(quizItem.id, option.id)} />
            <Input
              placeholder={`Response ${index + 1}`}
              value={option.text}
              onChange={(e) =>
                changeOptionTitle(quizItem.id, option.id, e.target.value)
              }
            />
          </ListItem>
        ))}
      </QuizItemOptionsContainer>
    </QuizItemContainer>
  );
};

const QuizItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  min-width: 500px;
  background-color: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0.25rem 0.25rem 0.5rem rgb(182, 182, 182);
`;

const QuizItemHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  width: 100%;
`;

const QuizItemOptionsContainer = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.5rem;
  width: 100%;
  list-style-type: none;
  padding: 0;
`;

const ListItem = styled.li`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 1rem;
  width: 100%;
`;

const CheckBox = styled.input`
  padding: 0.5rem;
  width: 20px;
`;

const Input = styled.input`
  width: calc(100% - 4rem);
  margin: 0.25rem;
  padding: 0.5rem;
`;

const RemoveButton = styled.button`
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  background-color: #db2121;
  color: #f3f3f3;
  font-weight: bolder;
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0.25rem 0.25rem 0.5rem rgb(182, 182, 182);
  cursor: pointer;
`;

const QuizNameInput = styled(Input)`
  margin-bottom: 3rem;
  max-width: 300px;
`;