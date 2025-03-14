import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LevelPoint from "../components/LevelPoint";
import OXButton from "../components/OXButton";
import QuizContent from "../components/QuizContent";
import Answer from "../components/Answer";
import BackButton from "../../../common/components/BackButton";
import api from "../../../utils/api";
import useQuiz from "../../../hooks/useQuiz";
import GPTlogo from "../../../assets/tradetown/GPTlogo.png";

const TodayQuizPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const difficulty = queryParams.get("difficulty");

  const {
    userUid,
    quizData,
    setQuizData,
    loading,
    setLoading,
    submitted,
    setSubmitted
  } = useQuiz();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [answerVisible, setAnswerVisible] = useState(false);

  useEffect(() => {
    if (submitted) return;

    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quizs?difficulty=${difficulty}`);
        setQuizData(response.data);
      } catch (error) {
        console.error("퀴즈 로딩 오류:", error.response?.data || error.message);
        alert("퀴즈 데이터를 가져오는 중 오류가 발생했습니다.");
        navigate("/quiz");
      } finally {
        setLoading(false);
      }
    };

    if (difficulty) {
      fetchQuiz();
    } else {
      alert("퀴즈 난이도가 없습니다.");
      navigate("/quiz");
    }
  }, [difficulty, navigate, setQuizData, setLoading, submitted]);

  const handleAnswerSubmit = async (answer) => {
    if (!quizData || submitted) return;

    setSelectedAnswer(answer);
    setSubmitted(true);

    try {
      const response = await api.post("/quizs", {
        quizId: quizData.id,
        userAnswer: answer
      });

      setFeedback(response.data);
      setAnswerVisible(true);

      localStorage.setItem(
        `${userUid}_quiz_answer`,
        JSON.stringify({ quizId: quizData.id, userAnswer: answer })
      );

      setTimeout(() => {
        setAnswerVisible(false);
        navigate("/quiz");
      }, 1500);
    } catch (error) {
      console.error("정답 제출 오류:", error.response?.data || error.message);
      alert("정답 제출 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute top-4 left-4">
        <span onClick={() => navigate(-1)}>
          <BackButton className="w-8 h-8 object-contain" />
        </span>
      </div>
      <div className="absolute flex flex-col items-center top-1 right-3 rounded-full border-gray-500 shadow-[0_20px_20px_rgba(0,0,0,0.2)] hover:opacity-65">
        <img
          src={GPTlogo}
          alt="GPT Logo"
          className="w-20 h-20 cursor-pointer "
          onClick={() => navigate("/ChatbotPage")}
        />
      </div>
      <div className="flex flex-col items-center">
        <div className="w-full flex justify-center mt-26">
          <LevelPoint level={difficulty} />
        </div>

        <div className="w-[85%] mt-8">
          {loading ? (
            <p className="text-center text-lg font-bold">퀴즈 로딩 중...</p>
          ) : (
            <QuizContent>
              {quizData?.title || "퀴즈를 불러오지 못했습니다."}
            </QuizContent>
          )}
        </div>

        <div className="fixed bottom-20 w-full mt-24 relative flex flex-col items-center">
          <Answer
            text={feedback?.correct ? "정답!" : "땡!"}
            visible={answerVisible}
          />
          <div className="fixed bottom-20">
            <OXButton onAnswer={handleAnswerSubmit} disabled={submitted} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayQuizPage;
