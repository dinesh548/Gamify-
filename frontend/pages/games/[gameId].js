import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import { gamesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PlayGame() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { gameId } = router.query;
  const [game, setGame] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (gameId && user) {
      loadGame();
    }
  }, [gameId, user, authLoading]);

  useEffect(() => {
    if (!submitted && game) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [submitted, game, startTime]);

  const loadGame = async () => {
    try {
      const res = await gamesAPI.getById(gameId);
      setGame(res.data);
      const gameData = res.data.gameData || res.data;
      setAnswers(new Array(gameData.questions?.length || gameData.scenarios?.length || 0).fill(null));
    } catch (error) {
      toast.error('Failed to load game');
      router.push('/games');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex, answer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some(a => a === null || a === undefined)) {
      toast.error('Please answer all questions');
      return;
    }

    setSubmitted(true);
    try {
      const res = await gamesAPI.submitResult(gameId, {
        answers,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
      });
      setResult(res.data);
      toast.success(`You earned ${res.data.xpEarned} XP!`);
    } catch (error) {
      toast.error('Failed to submit game result');
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (!game) return null;

  const gameData = game.gameData || game;
  const questions = gameData.questions || gameData.scenarios || [];
  const currentQ = questions[currentQuestion];

  if (result) {
    return (
      <Layout>
        <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
          <div className="bg-dark-800 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">Game Complete!</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-dark-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Score</p>
                <p className="text-2xl font-bold text-primary-400">{result.score}%</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Accuracy</p>
                <p className="text-2xl font-bold text-green-400">{result.accuracy}%</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">XP Earned</p>
                <p className="text-2xl font-bold text-yellow-400">+{result.xpEarned}</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Time</p>
                <p className="text-2xl font-bold text-purple-400">{timeSpent}s</p>
              </div>
            </div>
            <p className="text-lg mb-6">{result.feedback}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/games')}
                className="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded-lg"
              >
                Back to Games
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-dark-700 hover:bg-dark-600 px-6 py-2 rounded-lg"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
        <div className="bg-dark-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{gameData.title}</h1>
            <div className="text-sm text-gray-400">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-lg p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{currentQ.question || currentQ.description}</h2>

            {currentQ.type === 'multiple-choice' && (
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQuestion, option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[currentQuestion] === option
                        ? 'border-primary-500 bg-primary-900/20'
                        : 'border-dark-600 hover:border-dark-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQ.type === 'true-false' && (
              <div className="space-y-3">
                {[true, false].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAnswer(currentQuestion, value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[currentQuestion] === value
                        ? 'border-primary-500 bg-primary-900/20'
                        : 'border-dark-600 hover:border-dark-500'
                    }`}
                  >
                    {value ? 'True' : 'False'}
                  </button>
                ))}
              </div>
            )}

            {gameData.type === 'coding' && (
              <div>
                <textarea
                  value={answers[currentQuestion] || ''}
                  onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                  className="w-full h-64 p-4 bg-dark-700 border border-dark-600 rounded-lg font-mono text-sm"
                  placeholder="Write your code here..."
                />
                {currentQ.hint && (
                  <p className="mt-2 text-sm text-gray-400">💡 Hint: {currentQ.hint}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-dark-700 rounded-lg disabled:opacity-50"
            >
              ← Previous
            </button>
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="px-4 py-2 bg-primary-600 rounded-lg"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
              >
                Submit Game
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
