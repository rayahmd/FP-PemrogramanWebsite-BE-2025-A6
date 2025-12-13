import { prisma } from '@/common';
import {
  type CheckGameshowAnswerDTO,
  type CreateGameshowDTO,
  type GameshowParameters,
  type GameshowQuestion,
} from './schema';

export const GameshowQuizService = {
  // Play Game (public/private)
  playGame: async (gameId: string, isPreview: boolean, userId?: string) => {
    const game = await prisma.games.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail_image: true,
        is_published: true,
        creator_id: true,
        game_json: true,
        game_template: { select: { slug: true } },
      },
    });
    if (!game || game.game_template.slug !== 'gameshow-quiz') throw new Error('Game tidak ditemukan');
    if (isPreview) {
      if (!userId || game.creator_id !== userId) throw new Error('Akses ditolak: hanya creator yang bisa preview');
    } else {
      if (!game.is_published) throw new Error('Game belum dipublish');
    }
    // Data yang dikirim sama seperti getGameParams (tanpa kunci jawaban)
    const gameData = game.game_json as unknown as GameshowParameters;
    const sanitizedQuestions = gameData.questions.map((q: GameshowQuestion) => ({
      id: q.id,
      text: q.text,
      imageUrl: q.imageUrl,
      timeLimit: q.timeLimit,
      points: q.points,
      options: q.options.map(opt => ({ id: opt.id, text: opt.text })),
    }));
    return {
      id: game.id,
      title: game.name,
      description: game.description,
      thumbnail: game.thumbnail_image,
      questions: sanitizedQuestions,
    };
  },

  // List all gameshow quizzes
  listAll: async () => {
    const template = await prisma.gameTemplates.findUnique({ where: { slug: 'gameshow-quiz' } });
    if (!template) throw new Error('Template Gameshow tidak ditemukan. Jalankan seeder!');
    const games = await prisma.games.findMany({
      where: { game_template_id: template.id },
      orderBy: { created_at: 'desc' },
    });
    return games;
  },

  // Update gameshow quiz
  update: async (id: string, payload: CreateGameshowDTO, creatorId: string) => {
    const game = await prisma.games.findUnique({ where: { id } });
    if (!game) throw new Error('Game tidak ditemukan');
    if (game.creator_id !== creatorId) throw new Error('Akses ditolak: hanya creator yang bisa update');
    return prisma.games.update({
      where: { id },
      data: {
        name: payload.title,
        description: payload.description ?? '',
        thumbnail_image: payload.thumbnail ?? '',
        game_json: payload.gameData as object,
        updated_at: new Date(),
      },
    });
  },

  // Delete gameshow quiz
  delete: async (id: string, creatorId: string) => {
    const game = await prisma.games.findUnique({ where: { id } });
    if (!game) throw new Error('Game tidak ditemukan');
    if (game.creator_id !== creatorId) throw new Error('Akses ditolak: hanya creator yang bisa hapus');
    await prisma.games.delete({ where: { id } });
  },

  createGame: async (payload: CreateGameshowDTO, creatorId: string) => {
    const template = await prisma.gameTemplates.findUnique({
      where: { slug: 'gameshow-quiz' },
    });
    if (!template)
      throw new Error('Template Gameshow tidak ditemukan. Jalankan seeder!');
    return prisma.games.create({
      data: {
        name: payload.title,
        description: payload.description ?? '',
        thumbnail_image: payload.thumbnail ?? '',
        game_template_id: template.id,
        creator_id: creatorId,
        is_published: true,
        game_json: payload.gameData as object,
      },
    });
  },

  getGameParams: async (gameId: string) => {
    const game = await prisma.games.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail_image: true,
        game_json: true,
        game_template: { select: { slug: true } },
      },
    });
    if (!game || game.game_template.slug !== 'gameshow-quiz') throw new Error('Game tidak ditemukan');
    const gameData = game.game_json as unknown as GameshowParameters;
    const sanitizedQuestions = gameData.questions.map(
      (q: GameshowQuestion) => ({
        id: q.id,
        text: q.text,
        imageUrl: q.imageUrl,
        timeLimit: q.timeLimit,
        points: q.points,
        options: q.options.map(opt => ({
          id: opt.id,
          text: opt.text,
        })),
      }),
    );
    return {
      id: game.id,
      title: game.name,
      description: game.description,
      thumbnail: game.thumbnail_image,
      questions: sanitizedQuestions,
    };
  },

  checkAnswer: async (gameId: string, payload: CheckGameshowAnswerDTO) => {
    const game = await prisma.games.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        game_json: true,
        game_template: { select: { slug: true } },
      },
    });
    if (!game || game.game_template.slug !== 'gameshow-quiz') throw new Error('Game tidak ditemukan');
    const gameData = game.game_json as unknown as GameshowParameters;
    const question = gameData.questions.find(q => q.id === payload.questionId);
    if (!question) throw new Error('Pertanyaan tidak valid');
    const selectedOption = question.options.find(
      o => o.id === payload.selectedOptionId,
    );
    if (!selectedOption) throw new Error('Pilihan jawaban tidak valid');
    const isCorrect = selectedOption.isCorrect;
    let earnedPoints = 0;
    if (isCorrect) {
      const maxPoints = question.points || 1000;
      if (payload.timeTaken === undefined) {
        earnedPoints = maxPoints;
      } else {
        const timeRatio = Math.max(
          0,
          (question.timeLimit - payload.timeTaken) / question.timeLimit,
        );
        earnedPoints = Math.round(
          maxPoints * 0.5 + maxPoints * 0.5 * timeRatio,
        );
      }
    }
    const correctOption = question.options.find(o => o.isCorrect);
    return {
      isCorrect,
      correctOptionId: correctOption?.id ?? null,
      score: earnedPoints,
      message: isCorrect ? 'Luar Biasa!' : 'Yah, coba lagi!',
    };
  },
};
