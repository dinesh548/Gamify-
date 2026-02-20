/**
 * Reusable JSON-Based Game Engine
 * 
 * This engine dynamically loads and processes games from JSON files.
 * Supports multiple game types: quiz, coding, simulation
 */

class GameEngine {
  constructor() {
    this.gameTypes = {
      quiz: this.processQuizGame.bind(this),
      coding: this.processCodingGame.bind(this),
      simulation: this.processSimulationGame.bind(this)
    };
  }

  /**
   * Load and validate a game from JSON
   */
  loadGame(gameData) {
    if (!gameData || !gameData.gameId) {
      throw new Error('Invalid game data: missing gameId');
    }

    if (!gameData.type || !this.gameTypes[gameData.type]) {
      throw new Error(`Unsupported game type: ${gameData.type}`);
    }

    return {
      gameId: gameData.gameId,
      title: gameData.title,
      description: gameData.description,
      type: gameData.type,
      difficulty: gameData.difficulty || 'beginner',
      skillsTagged: gameData.skillsTagged || [],
      xpReward: gameData.xpReward || 10,
      timeLimit: gameData.timeLimit,
      questions: gameData.questions || gameData.scenarios || [],
      metadata: gameData.metadata || {}
    };
  }

  /**
   * Process game result based on answers and time spent
   */
  processGameResult(gameData, answers, timeSpent) {
    const game = this.loadGame(gameData);
    const processor = this.gameTypes[game.type];
    
    if (!processor) {
      throw new Error(`No processor found for game type: ${game.type}`);
    }

    return processor(game, answers, timeSpent);
  }

  /**
   * Process Quiz Game
   */
  processQuizGame(game, answers, timeSpent) {
    const questions = game.questions || [];
    let correctCount = 0;
    const results = [];

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = this.checkAnswer(question, userAnswer);
      
      if (isCorrect) correctCount++;
      
      results.push({
        questionId: question.id || index,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? (question.points || 1) : 0
      });
    });

    const totalQuestions = questions.length;
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
    const maxPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const score = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

    // Calculate XP based on accuracy and time
    const baseXP = game.xpReward || 10;
    const accuracyMultiplier = accuracy / 100;
    const timeBonus = this.calculateTimeBonus(game.timeLimit, timeSpent);
    const xpEarned = Math.round(baseXP * accuracyMultiplier * timeBonus);

    return {
      score: Math.round(score),
      accuracy: Math.round(accuracy),
      correctAnswers: correctCount,
      totalQuestions,
      xpEarned,
      timeSpent,
      results,
      feedback: this.generateQuizFeedback(accuracy, correctCount, totalQuestions)
    };
  }

  /**
   * Process Coding Challenge Game
   */
  processCodingGame(game, answers, timeSpent) {
    const challenges = game.questions || [];
    let correctCount = 0;
    const results = [];

    challenges.forEach((challenge, index) => {
      const userCode = answers[index]?.code || answers[index];
      const testResults = this.runCodeTests(challenge, userCode);
      
      const isCorrect = testResults.passed === testResults.total;
      if (isCorrect) correctCount++;
      
      results.push({
        challengeId: challenge.id || index,
        challenge: challenge.description || challenge.question,
        testResults,
        isCorrect,
        points: isCorrect ? (challenge.points || 5) : 0
      });
    });

    const totalChallenges = challenges.length;
    const accuracy = totalChallenges > 0 ? (correctCount / totalChallenges) * 100 : 0;
    const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
    const maxPoints = challenges.reduce((sum, c) => sum + (c.points || 5), 0);
    const score = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

    const baseXP = game.xpReward || 15;
    const accuracyMultiplier = accuracy / 100;
    const timeBonus = this.calculateTimeBonus(game.timeLimit, timeSpent);
    const xpEarned = Math.round(baseXP * accuracyMultiplier * timeBonus);

    return {
      score: Math.round(score),
      accuracy: Math.round(accuracy),
      correctAnswers: correctCount,
      totalChallenges,
      xpEarned,
      timeSpent,
      results,
      feedback: this.generateCodingFeedback(accuracy, correctCount, totalChallenges)
    };
  }

  /**
   * Process Simulation Game
   */
  processSimulationGame(game, answers, timeSpent) {
    const scenarios = game.questions || [];
    let correctCount = 0;
    const results = [];

    scenarios.forEach((scenario, index) => {
      const userChoice = answers[index];
      const isCorrect = this.checkScenarioChoice(scenario, userChoice);
      
      if (isCorrect) correctCount++;
      
      results.push({
        scenarioId: scenario.id || index,
        scenario: scenario.description || scenario.question,
        userChoice,
        correctChoice: scenario.correctChoice,
        isCorrect,
        points: isCorrect ? (scenario.points || 3) : 0,
        explanation: scenario.explanation
      });
    });

    const totalScenarios = scenarios.length;
    const accuracy = totalScenarios > 0 ? (correctCount / totalScenarios) * 100 : 0;
    const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
    const maxPoints = scenarios.reduce((sum, s) => sum + (s.points || 3), 0);
    const score = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

    const baseXP = game.xpReward || 12;
    const accuracyMultiplier = accuracy / 100;
    const timeBonus = this.calculateTimeBonus(game.timeLimit, timeSpent);
    const xpEarned = Math.round(baseXP * accuracyMultiplier * timeBonus);

    return {
      score: Math.round(score),
      accuracy: Math.round(accuracy),
      correctAnswers: correctCount,
      totalScenarios,
      xpEarned,
      timeSpent,
      results,
      feedback: this.generateSimulationFeedback(accuracy, correctCount, totalScenarios)
    };
  }

  /**
   * Check if answer is correct (for quiz)
   */
  checkAnswer(question, userAnswer) {
    if (question.type === 'multiple-choice') {
      return String(userAnswer) === String(question.correctAnswer);
    } else if (question.type === 'true-false') {
      return Boolean(userAnswer) === Boolean(question.correctAnswer);
    } else if (question.type === 'text') {
      // Simple text matching (case-insensitive)
      const correct = String(question.correctAnswer).toLowerCase().trim();
      const user = String(userAnswer).toLowerCase().trim();
      return correct === user || correct.includes(user) || user.includes(correct);
    }
    return false;
  }

  /**
   * Run code tests (simplified - in production would use actual code execution)
   */
  runCodeTests(challenge, userCode) {
    // This is a simplified version - in production, you'd use a code execution service
    const testCases = challenge.testCases || [];
    let passed = 0;
    const testResults = [];

    testCases.forEach((testCase, index) => {
      // Simplified: check if code contains expected patterns
      // In production, this would actually execute the code
      const hasExpectedPattern = challenge.expectedPattern 
        ? userCode.includes(challenge.expectedPattern)
        : true;
      
      const testPassed = hasExpectedPattern && userCode.length > 10;
      if (testPassed) passed++;
      
      testResults.push({
        testCase: index + 1,
        passed: testPassed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput
      });
    });

    return {
      passed,
      total: testCases.length || 1,
      testResults
    };
  }

  /**
   * Check scenario choice
   */
  checkScenarioChoice(scenario, userChoice) {
    return String(userChoice) === String(scenario.correctChoice);
  }

  /**
   * Calculate time bonus multiplier
   */
  calculateTimeBonus(timeLimit, timeSpent) {
    if (!timeLimit) return 1.0;
    const timeRatio = timeSpent / timeLimit;
    if (timeRatio <= 0.5) return 1.2; // Fast completion bonus
    if (timeRatio <= 0.8) return 1.0; // Normal
    if (timeRatio <= 1.0) return 0.9; // Slightly slow
    return 0.7; // Over time limit penalty
  }

  /**
   * Generate feedback messages
   */
  generateQuizFeedback(accuracy, correct, total) {
    if (accuracy >= 90) {
      return `Excellent! You got ${correct}/${total} correct. Outstanding performance!`;
    } else if (accuracy >= 70) {
      return `Good job! You got ${correct}/${total} correct. Keep practicing!`;
    } else if (accuracy >= 50) {
      return `Not bad! You got ${correct}/${total} correct. Review the concepts and try again.`;
    } else {
      return `You got ${correct}/${total} correct. Don't give up! Review the material and practice more.`;
    }
  }

  generateCodingFeedback(accuracy, correct, total) {
    if (accuracy >= 90) {
      return `Brilliant coding! ${correct}/${total} challenges solved correctly.`;
    } else if (accuracy >= 70) {
      return `Well done! ${correct}/${total} challenges solved. Keep coding!`;
    } else {
      return `${correct}/${total} challenges solved. Practice more to improve your coding skills.`;
    }
  }

  generateSimulationFeedback(accuracy, correct, total) {
    if (accuracy >= 90) {
      return `Excellent decision-making! ${correct}/${total} scenarios handled correctly.`;
    } else if (accuracy >= 70) {
      return `Good choices! ${correct}/${total} scenarios correct.`;
    } else {
      return `${correct}/${total} scenarios correct. Think through each scenario carefully.`;
    }
  }
}

// Export singleton instance
const gameEngine = new GameEngine();

module.exports = gameEngine;
module.exports.GameEngine = GameEngine;
