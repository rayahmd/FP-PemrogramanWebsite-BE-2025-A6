
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { GameshowQuizService } from './gameshow-quiz.service';
import { CheckGameshowAnswerSchema, type CheckGameshowAnswerDTO, type CreateGameshowDTO } from './schema';

const GameshowQuizController = Router();

// CREATE
GameshowQuizController.post('/', async (
  request: Request<Record<string, never>, object, CreateGameshowDTO>,
  response: Response,
  next: NextFunction,
) => {
  try {
    const creatorId = (request as any).user?.user_id;
    const newGame = await GameshowQuizService.createGame(request.body, creatorId);
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
});

// LIST ALL
GameshowQuizController.get('/', async (
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
});

// PLAY GAME (Public)
GameshowQuizController.get('/play/:id', async (
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
});

// PLAY GAME (Private/Preview, hanya creator)
GameshowQuizController.get('/preview/:id', async (
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
});

// READ DETAIL
GameshowQuizController.get('/:id', async (
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
});

// EVALUATE QUIZ ANSWER
GameshowQuizController.post('/:id/evaluate', async (
  request: Request<{ id: string }, object, CheckGameshowAnswerDTO>,
  response: Response,
  next: NextFunction,
) => {
  try {
    const { id } = request.params;
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
});

// UPDATE
GameshowQuizController.put('/:id', async (
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
});

// DELETE
GameshowQuizController.delete('/:id', async (
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
});

export default GameshowQuizController;
