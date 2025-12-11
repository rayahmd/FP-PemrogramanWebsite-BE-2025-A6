import { z } from 'zod';

export const CheckGameshowAnswerSchema = z.object({
  questionId: z.string().min(1, "ID Pertanyaan tidak boleh kosong"),
  selectedOptionId: z.string().min(1, "ID Jawaban tidak boleh kosong"),
  timeTaken: z.number().min(0).optional()
});

export type CheckGameshowAnswerDTO = z.infer<typeof CheckGameshowAnswerSchema>;