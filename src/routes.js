import { Router } from 'express';

import SessionController from './app/controllers/SessionController';
import RecipientsController from './app/controllers/RecipientsController';

import authMiddlewares from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);

/* Verifica se o usuário está autenticado */
routes.use(authMiddlewares);

// Inclusão do destinatário
routes.post('/recipients', RecipientsController.store);

// Atualizando informações do destinatário
routes.put('/recipients', RecipientsController.update);

export default routes;
