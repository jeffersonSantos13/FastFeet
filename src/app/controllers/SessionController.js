import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/Users';
import authConfig from '../../config/auth';

class SessionController {
  async store(req,res) {
    /* Valida se o e-mail e senha foram informados */
    const schema = Yup.object({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    if(!(await schema.isValid(req.body)) ) {
      return res.status(401).json({ error: "Validadion fails " });
    }

    const { email, password } = req.body;

    // Verifica se o usuário informado existe

    const user = await User.findOne({where: { email } });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verifica se a senha informada confere
    if (!(await user.checkPassword(password)) ) {
      return res.status(401).json({ error: "Password does not match" });
    }

    const { id, name } = user;

    // Token de autenticação
    return res.json({
      user: {
        id,
        name,
        email
      },
      token: jwt.sign({ id }, authConfig.secreat, {
        expiresIn: authConfig.expiresIn,
      }),
    });

  }
}

export default new SessionController();
