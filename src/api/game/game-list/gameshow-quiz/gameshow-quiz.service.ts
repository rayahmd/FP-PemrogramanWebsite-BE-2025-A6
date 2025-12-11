import { prisma } from '@/common';

import {
  type CheckGameshowAnswerDTO,
  type CreateGameshowDTO,
  type GameshowParameters,
  type GameshowQuestion,
} from './schema';

export const GameshowQuizService = {
  createGame: async (payload: CreateGameshowDTO, creatorId: string) => {
    // 1. Cek Template
    const template = await prisma.gameTemplates.findUnique({
      where: { slug: 'gameshow-quiz' },
    });

    if (!template)
      throw new Error('Template Gameshow tidak ditemukan. Jalankan seeder!');

    // 2. Simpan ke DB
    // payload.gameData sudah terjamin valid karena dicek oleh Zod di Controller
    return prisma.games.create({
      data: {
        name: payload.title,
        description: payload.description ?? '',
        thumbnail_image: payload.thumbnail ?? '', // URL String
        game_template_id: template.id,
        creator_id: creatorId,
        is_published: true, // Atau false jika mau draft dulu
        game_json: payload.gameData as object, // Cast ke object (valid Prisma Json type)
      },
    });
  },

  getGameParams: async (gameId: string) => {
    const game = await prisma.games.findUnique({ where: { id: gameId } });
    if (!game) throw new Error('Game tidak ditemukan');

    // Casting aman karena kita percaya validasi saat create
    const gameData = game.game_json as unknown as GameshowParameters;

    // SANITASI: Hapus kunci jawaban sebelum dikirim ke client
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
          // isCorrect DIBUANG disini agar aman
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
    // Code checkAnswer kamu yang tadi SUDAH BENAR & BAGUS
    // Tidak perlu diubah, copas saja bagian checkAnswer kamu sebelumnya.
    // ...
    const game = await prisma.games.findUnique({ where: { id: gameId } });
    if (!game) throw new Error('Game tidak ditemukan');

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

      // Logika Time Bonus
      if (payload.timeTaken === undefined) {
        earnedPoints = maxPoints;
      } else {
        // timeRatio: Sisa waktu / Total waktu
        const timeRatio = Math.max(
          0,
          (question.timeLimit - payload.timeTaken) / question.timeLimit,
        );
        // Rumus: Base 50% poin + (0-50% bonus berdasarkan kecepatan)
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
