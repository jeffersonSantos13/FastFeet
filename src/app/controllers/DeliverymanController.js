import * as Yup from 'yup';

import Deliverymans from '../models/Deliverymans';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const deliveryman = await Deliverymans.findAll({
      order: ['id'],
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['path', 'url'],
        },
      ],
    });

    return res.json(deliveryman);
  }

  async store(req, res) {
    const validationSchema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      avatar_id: Yup.number(),
    });

    if (!(await validationSchema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    /**
     * Verify if deliveryman e-mail is exists
     */
    const deliverymanExists = await Deliverymans.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman is exists' });
    }

    /**
     * Verify if avatar_id is exists
     */
    if (req.body.avatar_id) {
      const file = await File.findOne({
        where: {
          id: req.body.avatar_id,
        },
      });

      if (!file) {
        return res.status(400).json({ error: "Avatar id does't exists." });
      }
    }

    const deliveryman = await Deliverymans.create(req.body);

    return res.json(deliveryman);
  }

  async update(req, res) {
    const deliveryman = await Deliverymans.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: "Deliveryman does't exists" });
    }

    const validationSchema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number(),
    });

    if (!(await validationSchema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { email, name, avatar_id } = req.body;

    /**
     * Verify deliveryman is exists
     */
    if (email && email !== deliveryman.email) {
      const deliverymanExists = await Deliverymans.findOne({
        where: { email },
      });

      if (deliverymanExists) {
        return res.status(400).json({ error: 'Deliveryman already exists.' });
      }
    }

    if (avatar_id) {
      const file = await File.findOne({
        where: {
          id: avatar_id,
        },
      });

      if (!file) {
        return res.status(400).json({ error: "Avatar id does't exists." });
      }
    }

    const { id } = await deliveryman.update({
      name,
      email,
      avatar_id,
    });

    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }

  async delete(req, res) {
    const deliveryman = await Deliverymans.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: "Deliveryman does't exists" });
    }

    await deliveryman.destroy();

    return res.status(200).send();
  }
}

export default new DeliverymanController();
