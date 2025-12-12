import type { NextFunction, Request, Response } from 'express';


import { GameshowQuizService } from './gameshow-quiz.service';
import { CheckGameshowAnswerSchema, type CheckGameshowAnswerDTO, type CreateGameshowDTO } from './schema';

export const GameshowQuizController = {
  // Play Game (Public)
  playPublic: async (
    request: Request<{ id: string }>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const data = await GameshowQuizService.playGame(id, false, undefined);
      return response.json({ success: true, data });
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      return response.status(404).json({
        success: false,
        message: err.message as string,
      });
    }
  },

  // Play Game (Private/Preview, hanya creator)
  playPrivate: async (
    request: Request<{ id: string }>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const creatorId = (request as any).user?.user_id;
      const data = await GameshowQuizService.playGame(id, true, creatorId);
      return response.json({ success: true, data });
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      return response.status(403).json({
        success: false,
        message: err.message as string,
      });
    }
  },
  create: async (
    request: Request<Record<string, never>, object, CreateGameshowDTO>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const creatorId = (request as any).user?.user_id;

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
      // Validasi body agar error lebih jelas
      const payload = CheckGameshowAnswerSchema.parse(request.body);
      const result = await GameshowQuizService.checkAnswer(id, payload);
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
  // List all gameshow quizzes
  listAll: async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const data = await GameshowQuizService.listAll();
      return response.json({ success: true, data });
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      return response.status(400).json({
        success: false,
        error: err.errors ?? err.message,
      });
    }
  },

  // Update a gameshow quiz
  update: async (
    request: Request<{ id: string }, object, CreateGameshowDTO>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const creatorId = (request as any).user?.user_id;
      const updated = await GameshowQuizService.update(id, request.body, creatorId);
      return response.json({ success: true, message: 'Gameshow Quiz berhasil diupdate!', data: updated });
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      return response.status(400).json({
        success: false,
        error: err.errors ?? err.message,
      });
    }
  },

  // Delete a gameshow quiz
  delete: async (
    request: Request<{ id: string }>,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = request.params;
      const creatorId = (request as any).user?.user_id;
      await GameshowQuizService.delete(id, creatorId);
      return response.json({ success: true, message: 'Gameshow Quiz berhasil dihapus!' });
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      return response.status(400).json({
        success: false,
        error: err.errors ?? err.message,
      });
    }
  },
};
