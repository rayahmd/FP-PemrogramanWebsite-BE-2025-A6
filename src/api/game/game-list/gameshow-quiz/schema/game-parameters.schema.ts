import { z } from 'zod';

// Schema untuk satu Opsi Jawaban (misal: A, B, C, D)
const GameshowOptionSchema = z.object({
  id: z.string().min(1, 'ID opsi tidak boleh kosong'),
  text: z.string().min(1, 'Teks jawaban tidak boleh kosong'),
  isCorrect: z.boolean(), // Kunci jawaban: true jika ini jawaban benar
});

// Schema untuk satu Pertanyaan
const GameshowQuestionSchema = z.object({
  id: z.string().min(1, 'ID pertanyaan tidak boleh kosong'),
  text: z.string().min(1, 'Pertanyaan tidak boleh kosong'),
  imageUrl: z.string().url().optional(), // Opsional: URL gambar jika soal bergambar

  // Config ala Quizizz
  timeLimit: z.number().min(5).default(30), // Detik (default 30s)
  points: z.number().min(0).default(1000), // Poin maksimal soal ini

  options: z
    .array(GameshowOptionSchema)
    .min(2, 'Minimal harus ada 2 pilihan jawaban')
    .refine(options => options.some(opt => opt.isCorrect), {
      message: 'Harus ada minimal satu jawaban yang benar!',
    }),
});

// Schema Utama yang akan masuk ke kolom 'game_json' di DB
export const GameshowParametersSchema = z.object({
  questions: z
    .array(GameshowQuestionSchema)
    .min(1, 'Minimal harus ada 1 pertanyaan'),
  randomizeQuestions: z.boolean().default(false),
});

// Export Type untuk dipakai di Service/Frontend
export type GameshowParameters = z.infer<typeof GameshowParametersSchema>;
export type GameshowQuestion = z.infer<typeof GameshowQuestionSchema>;
export type GameshowOption = z.infer<typeof GameshowOptionSchema>;
