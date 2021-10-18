import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import styled from "styled-components";
import { axios } from "../axios";

export default function Quizzes() {

  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<any>([]);
  
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await axios.get("/quizzes");
      console.log(data);
      setQuizzes(data);
      setLoading(false);
    })()
  }, [])

  return (
    <Container>
      <h1>Quizzes</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <QuizzesContainer>
          {quizzes.map((quiz: any) => (
            <StyledLink to={`/host/${quiz.id}`} key={quiz.id}>
              {quiz.name}
            </StyledLink>
          ))}
        </QuizzesContainer>
      )}
    </Container>
  )

}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f3f3f3;
  min-height: 100vh;
`;

const QuizzesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: black;
  background-color: white;
  min-width: 400px;
  padding: 1rem;
  margin: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0.25rem 0.25rem 0.5rem rgb(182, 182, 182);

  &:hover {
    text-decoration: underline;
  }
`;