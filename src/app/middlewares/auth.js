import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  /* Verifica se o Token de autenticação foi informado */
  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  /* Desestruturando o array pegando a partir da segunda posição, retornando apenas o token */
  const [, token] = authHeader.split(' ');

  try {
    /* Verificando se o Token de autenticação informado é válido */
    const decoded = await promisify(jwt.verify)(token, authConfig.secreat);

    /* Retornando o ID do usuário */
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
