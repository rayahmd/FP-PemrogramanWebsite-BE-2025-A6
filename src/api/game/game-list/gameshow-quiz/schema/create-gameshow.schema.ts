import { z } from 'zod';
import { GameshowParametersSchema } from './game-parameters.schema'; // Import schema pertanyaanmu yang tadi

// Schema untuk Input dari Frontend/Controller
export const CreateGameshowSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  
  // Ini URL string hasil upload dari Controller (bukan file object lagi)
  thumbnail: z.string().url().optional().or(z.literal('')), 
  
  // Validasi struktur JSON game-nya disini agar aman sebelum masuk DB
  gameData: GameshowParametersSchema, 
});

export type CreateGameshowDTO = z.infer<typeof CreateGameshowSchema>;