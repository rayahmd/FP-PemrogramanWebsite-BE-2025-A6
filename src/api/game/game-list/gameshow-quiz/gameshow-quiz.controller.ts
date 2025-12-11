import type { NextFunction, Request, Response } from 'express';

import { GameshowQuizService } from './gameshow-quiz.service';
import { type CheckGameshowAnswerDTO, type CreateGameshowDTO } from './schema';

export const GameshowQuizController = {
  create: async (
    request: Request<Record<string, never>, object, CreateGameshowDTO>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const creatorId = (request as any).user?.id ?? 'user-id-placeholder';

      const newGame = await GameshowQuizService.createGame(
        request.body,
        creatorId,
      );

      return response.status(201).json({
        success: true,
        message: 'Gameshow Quiz berhasil dibuat!',
        data: newGame,
      });
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      return response.status(400).json({
        success: false,
        error: err.errors ?? err.message,
      });
    }
  },

  getGameParams: async (
    request: Request<{ id: string }, object, Record<string, never>>,
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
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      return response.status(404).json({
        success: false,
        message: err.message as string,
      });
    }
  },

  checkAnswer: async (
    request: Request<{ id: string }, object, CheckGameshowAnswerDTO>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = request.params;

      const result = await GameshowQuizService.checkAnswer(id, request.body);

      return response.json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      return response.status(400).json({
        success: false,
        error: err.errors ?? err.message,
      });
    }
  },
};
