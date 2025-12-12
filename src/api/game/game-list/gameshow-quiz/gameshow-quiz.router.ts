
import { Router } from 'express';
import { GameshowQuizController } from './gameshow-quiz.controller';
import { validateAuth } from '@/common';


const router = Router();


// CREATE
router.post('/', validateAuth({}), GameshowQuizController.create);

// LIST ALL
router.get('/', GameshowQuizController.listAll);


// PLAY GAME (Public)
router.get('/play/:id', GameshowQuizController.playPublic);

// PLAY GAME (Private/Preview, hanya creator)
router.get('/preview/:id', validateAuth({}), GameshowQuizController.playPrivate);

// READ DETAIL
router.get('/:id', GameshowQuizController.getGameParams);

// EVALUATE QUIZ ANSWER
router.post('/:id/evaluate', GameshowQuizController.checkAnswer);

// UPDATE
router.put('/:id', validateAuth({}), GameshowQuizController.update);

// DELETE
router.delete('/:id', validateAuth({}), GameshowQuizController.delete);

export default router;
