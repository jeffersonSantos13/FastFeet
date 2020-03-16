import { Op } from 'sequelize';

import Order from '../models/Order';
import File from '../models/File';
import Deliveryman from '../models/Deliveryman';

class DeliveryController {
  async show(req, res) {
    const { id: deliveryman_id } = req.params;

    if (!deliveryman_id) {
      return res.status(400).json({ error: 'Deliveryman is not informed' });
    }

    const order = await Order.findAll({
      order: ['start_date'],
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
      where: {
        deliveryman_id,
        end_date: {
          [Op.not]: null,
        },
        canceled_at: null,
      },
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(order);
  }
}

export default new DeliveryController();
