/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-default-export */
import { Router } from 'express';

import { AnagramController } from './anagram/anagram.controller';
import { PairOrNoPairController } from './pair-or-no-pair/pair-or-no-pair.controller';
import { QuizController } from './quiz/quiz.controller';
import { SpeedSortingController } from './speed-sorting/speed-sorting.controller';
import { TypeSpeedController } from './type-speed/type-speed.controller';
import { GameshowQuizRouter } from './gameshow-quiz/gameshow-quiz.router';

const GameListRouter = Router();

GameListRouter.use('/quiz', QuizController);
GameListRouter.use('/speed-sorting', SpeedSortingController);
GameListRouter.use('/anagram', AnagramController);
GameListRouter.use('/pair-or-no-pair', PairOrNoPairController);
GameListRouter.use('/type-speed', TypeSpeedController);
GameListRouter.use('/gameshow-quiz', GameshowQuizRouter);

export default GameListRouter;