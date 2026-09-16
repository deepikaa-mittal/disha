import api from './apiClient';

export const learningService = {
  async getTodayQuiz() {
    try {
      const quiz = await api.post('/quizzes/today');
      if (quiz && quiz.questions && quiz.questions.length > 0) {
        return quiz;
      }
    } catch (e) {
      console.warn('Today quiz fallback:', e.message);
    }
    return this.getFallbackQuiz();
  },

  async getDueRetentionCards() {
    try {
      const cards = await api.get('/retention/due');
      if (Array.isArray(cards) && cards.length > 0) {
        return cards;
      }
    } catch (e) {
      console.warn('Retention cards fallback:', e.message);
    }
    return this.getFallbackRetentionCards();
  },

  async submitAttempt(quizQuestionId, selectedOptionId, isCorrect) {
    try {
      return await api.post('/quizzes/attempts', {
        quiz_question_id: quizQuestionId,
        selected_option_id: selectedOptionId,
        is_correct: isCorrect,
      });
    } catch (e) {
      console.warn('Attempt record fallback:', e.message);
      return { quiz_question_id: quizQuestionId, is_correct: isCorrect };
    }
  },

  async submitReview(userRetentionCardId, result) {
    try {
      return await api.post('/retention/reviews', {
        user_retention_card_id: userRetentionCardId,
        result: result, // 'again', 'hard', 'good', 'easy'
      });
    } catch (e) {
      console.warn('Retention review record fallback:', e.message);
      return { user_retention_card_id: userRetentionCardId, result };
    }
  },

  getFallbackQuiz() {
    return {
      id: 'quiz-today',
      title: 'Daily High-Yield Retention Quiz',
      description: 'Test your active recall on recent constitutional law, tech sovereignty, and cognitive frameworks.',
      estimatedMinutes: 5,
      questions: [
        {
          id: 'q1',
          prompt: 'Which landmark judgment established the Doctrine of the Basic Structure of the Constitution?',
          explanation: 'Kesavananda Bharati v. State of Kerala (1973) held that while Parliament has wide powers to amend the Constitution, it cannot alter its basic structure.',
          options: [
            { id: 'opt-1a', text: 'Golaknath v. State of Punjab', isCorrect: false },
            { id: 'opt-1b', text: 'Kesavananda Bharati v. State of Kerala', isCorrect: true },
            { id: 'opt-1c', text: 'Minerva Mills v. Union of India', isCorrect: false },
            { id: 'opt-1d', text: 'Maneka Gandhi v. Union of India', isCorrect: false },
          ],
        },
        {
          id: 'q2',
          prompt: 'What is the primary wavelength used in Extreme Ultraviolet (EUV) lithography systems produced by ASML?',
          explanation: 'EUV lithography employs light with a wavelength of approximately 13.5 nanometers to pattern nanoscale transistor features.',
          options: [
            { id: 'opt-2a', text: '193 nanometers (DUV)', isCorrect: false },
            { id: 'opt-2b', text: '13.5 nanometers', isCorrect: true },
            { id: 'opt-2c', text: '248 nanometers (KrF)', isCorrect: false },
            { id: 'opt-2d', text: '1.0 nanometer (X-ray)', isCorrect: false },
          ],
        },
        {
          id: 'q3',
          prompt: 'According to cognitive science, why is Active Recall superior to passive re-reading?',
          explanation: 'Active retrieval strengthens neural synaptic pathways and triggers the testing effect, reducing forgetting curves significantly.',
          options: [
            { id: 'opt-3a', text: 'It requires zero mental effort or cognitive energy', isCorrect: false },
            { id: 'opt-3b', text: 'It triggers neural retrieval pathways, inducing the testing effect', isCorrect: true },
            { id: 'opt-3c', text: 'It replaces the need for sleep or memory consolidation', isCorrect: false },
            { id: 'opt-3d', text: 'It only works for short-term rote memorization', isCorrect: false },
          ],
        },
      ],
    };
  },

  getFallbackRetentionCards() {
    return [
      {
        id: 'card-1',
        topicName: 'Constitutional Law',
        question: 'What four prongs constitute the Modern Proportionality Standard for fundamental rights restrictions?',
        answer: '1. Legitimate State Goal\n2. Rational Nexus (suitability)\n3. Necessity (least restrictive means)\n4. Balancing / Proportionality stricto sensu',
        intervalDays: 3,
        repetitions: 2,
        easeFactor: 2.5,
      },
      {
        id: 'card-2',
        topicName: 'Semiconductors & Compute',
        question: 'What is CoWoS (Chip-on-Wafer-on-Substrate) and why is it crucial for AI accelerators?',
        answer: 'CoWoS is an advanced 2.5D wafer-level packaging technology by TSMC that allows heterogeneous compute dies (GPU + High Bandwidth Memory) to be interconnected with ultra-low latency.',
        intervalDays: 7,
        repetitions: 4,
        easeFactor: 2.6,
      },
      {
        id: 'card-3',
        topicName: 'Cognitive Science',
        question: 'What is the Spacing Effect identified by Hermann Ebbinghaus?',
        answer: 'Learning is greater when studying is spread out over time rather than crammed into a single intensive session.',
        intervalDays: 1,
        repetitions: 1,
        easeFactor: 2.4,
      },
    ];
  },
};

export default learningService;
