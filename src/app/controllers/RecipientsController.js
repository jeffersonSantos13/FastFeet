import * as Yup from 'yup';
import cep from 'cep-promise';

import Recipients from '../models/Recipients';

class RecipientsController {
  // Inserir usuário
  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      rua: Yup.string().required(),
      numero: Yup.number().required().min(1),
      complemento: Yup.string().required(),
      estado: Yup.string().required(),
      cidade: Yup.string().required(),
      cep: Yup.string().required(),
    });

    // Valida se todas as informações do destinatários foram informados
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: "Validation fails" });
    }

    // Verifica se o CEP informado é válido
    try {
      await cep(req.body.cep);
    } catch(err) {
      return res.status(401).json({ error: "CEP informado não encontrado" });
    }

    // Inserindo destinatário
    const recipient = await Recipients.create(req.body);

    return res.json(recipient);
  };

  // Atualizando informações do destinatário
  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      nome: Yup.string(),
      rua: Yup.string(),
      numero: Yup.number().min(1),
      complemento: Yup.string(),
      estado: Yup.string(),
      cidade: Yup.string(),
      cep: Yup.string(),
    });

    // Valida se todas as informações do destinatários foram informados
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: "Validation fails" });
    }

    const recipient = await Recipients.findByPk(req.body.id);

    if (!recipient) {
      return res.status(401).json({ error: "Recipient does not exists" });
    }

    // Verifica se o CEP informado é válido
    if(req.body.cep){
      try {
        await cep(req.body.cep);
      } catch(err) {
        return res.status(401).json({ error: "CEP informado não encontrado" });
      }
    }

    // Atualizando destinatário
    const { id, nome, rua, numero, complemento, estado, cidade } = await recipient.update(req.body);

    return res.json({
      id,
      nome,
      rua,
      numero,
      complemento,
      estado,
      cidade,
      cep: req.body.cep
    });
  };
}

export default new RecipientsController();
