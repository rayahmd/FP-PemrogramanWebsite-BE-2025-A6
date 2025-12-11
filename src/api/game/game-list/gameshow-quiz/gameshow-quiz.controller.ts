import type { NextFunction, Request, Response } from 'express';
import { GameshowQuizService } from './gameshow-quiz.service';
import { type CreateGameshowDTO, type CheckGameshowAnswerDTO } from './schema';

export const GameshowQuizController = {
  /**
   * 1. CREATE GAME
   * Request body sudah divalidasi oleh validateBody middleware
   */
  create: async (
    request: Request<Record<string, never>, any, CreateGameshowDTO>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      // req.body sudah valid karena middleware validateBody sudah handle
      const creatorId = (request as any).user?.id ?? 'user-id-placeholder';

      const newGame = await GameshowQuizService.createGame(request.body, creatorId);

      return response.status(201).json({
        success: true,
        message: 'Gameshow Quiz berhasil dibuat!',
        data: newGame,
      });
    } catch (error: any) {
      return response.status(400).json({
        success: false,
        error: error.errors ?? error.message,
      });
    }
  },

  /**
   * 2. GET GAME DATA (PLAY)
   */
  getGameParams: async (
    request: Request<{ id: string }, any, Record<string, never>>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = request.params;

      const gameData = await GameshowQuizService.getGameParams(id);

      return response.json({
        success: true,
        data: gameData,
      });
    } catch (error: any) {
      return response.status(404).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * 3. CHECK ANSWER
   * Request body sudah divalidasi oleh validateBody middleware
   */
  checkAnswer: async (
    request: Request<{ id: string }, any, CheckGameshowAnswerDTO>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = request.params;

      // req.body sudah valid karena middleware validateBody sudah handle
      const result = await GameshowQuizService.checkAnswer(id, request.body);

      return response.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return response.status(400).json({
        success: false,
        error: error.errors ?? error.message,
      });
    }
  },
};