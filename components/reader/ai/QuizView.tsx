'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Trophy, RefreshCw, ArrowRight } from 'lucide-react';
import AIFeatureGate from './AIFeatureGate';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

interface QuizViewProps {
  bookId: string;
  chapterId?: string;
  userPlan?: string;
  isUnlocked?: boolean;
}

export default function QuizView({
  bookId,
  chapterId,
  userPlan = 'FREE',
  isUnlocked = false,
}: QuizViewProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuiz = async () => {
    if (!isUnlocked) return;
    setIsLoading(true);
    setError(null);

    try {
      // Fetch history first
      const histRes = await fetch(`/api/ai/quiz?bookId=${bookId}`);
      const histData = await histRes.json();
      if (histRes.ok && histData.bestScore !== undefined) {
        setBestScore(histData.bestScore);
      }

      // Generate/fetch quiz questions
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, chapterId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate quiz');
        return;
      }

      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setScore(0);
      setIsCompleted(false);
    } catch (err) {
      setError('Error generating quiz');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [bookId, chapterId, isUnlocked]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;

    setIsAnswerSubmitted(true);
    if (selectedOption === currentQ.correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz complete, record attempt
      setIsCompleted(true);
      const finalScore = score + (selectedOption === currentQ.correctAnswerIndex ? 1 : 0);

      try {
        await fetch('/api/ai/quiz', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId,
            score: finalScore,
            totalQuestions: questions.length,
          }),
        });
        if (finalScore > bestScore) {
          setBestScore(finalScore);
        }
      } catch (err) {
        console.error('Failed to submit quiz score:', err);
      }
    }
  };

  if (!isUnlocked) {
    return (
      <AIFeatureGate featureName="AI Chapter Quiz Generator" requiredPlan="PLUS" userPlan={userPlan}>
        <div />
      </AIFeatureGate>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 text-theme-text shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-theme/60">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-theme-heading font-montserrat">AI Knowledge Quiz</h3>
        </div>

        {bestScore > 0 && (
          <div className="flex items-center gap-1 text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
            <Trophy className="w-3.5 h-3.5" />
            <span>Best: {bestScore}/{questions.length || 3}</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-theme-muted space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
          <p>Generating custom quiz from chapter concepts...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {error}
        </div>
      ) : isCompleted ? (
        // Quiz Score Summary Screen
        <div className="p-8 text-center space-y-5 bg-theme-surface/40 rounded-3xl border border-theme/40">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-white font-extrabold flex items-center justify-center mx-auto shadow-xl">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-xl font-extrabold text-theme-heading font-montserrat">Quiz Completed!</h4>
            <p className="text-xs text-theme-muted">You scored {score} out of {questions.length}</p>
          </div>

          <div className="pt-2">
            <button
              onClick={fetchQuiz}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      ) : currentQ ? (
        // Question View
        <div className="space-y-5">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <p className="text-sm font-extrabold text-theme-heading font-montserrat leading-snug">
              {currentQ.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              let optionStyle = 'bg-theme-surface/60 border-theme/60 text-theme-heading hover:border-indigo-500';

              if (selectedOption === idx) {
                optionStyle = 'bg-indigo-500/10 border-indigo-500 text-indigo-500 font-bold';
              }

              if (isAnswerSubmitted) {
                if (idx === currentQ.correctAnswerIndex) {
                  optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-500 font-extrabold';
                } else if (selectedOption === idx) {
                  optionStyle = 'bg-red-500/20 border-red-500 text-red-500 font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-3.5 rounded-2xl border text-xs text-left transition-all flex items-center justify-between ${optionStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswerSubmitted && idx === currentQ.correctAnswerIndex && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  {isAnswerSubmitted && selectedOption === idx && idx !== currentQ.correctAnswerIndex && (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-2xl bg-theme-surface/80 border border-theme/60 space-y-1 animate-fade-in">
              <span className="text-[10px] font-black uppercase tracking-wider text-theme-muted">Explanation</span>
              <p className="text-xs text-theme-text font-semibold leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end pt-2">
            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-40 shadow-md transition-all"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
