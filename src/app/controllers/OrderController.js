import {
  isBefore,
  parseISO,
  setHours,
  isToday,
  isPast,
  isAfter,
} from 'date-fns';
import * as Yup from 'yup';
import { Op } from 'sequelize';

import Recipients from '../models/Recipients';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Order from '../models/Order';

class OrderController {
  async index(req, res) {
    const order = await Order.findAll({
      order: ['start_date'],
      attributes: ['id', 'product', 'end_date', 'canceled_at'],
      include: [
        {
          model: Recipients,
          as: 'recipient',
          attributes: [
            'id',
            'nome',
            'rua',
            'numero',
            'complemento',
            'cidade',
            'estado',
            'cep',
          ],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(order);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      signature_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, signature_id } = req.body;

    /**
     * Verify if recipient exists
     */
    const checkRecipientExists = await Recipients.findByPk(recipient_id);

    if (!checkRecipientExists) {
      return res.status(401).json({ error: 'Recipient does not exists.' });
    }

    /**
     * Verify if deliveryman exists
     */
    const checkDeliverymanExists = await Deliveryman.findByPk(deliveryman_id);

    if (!checkDeliverymanExists) {
      return res.status(401).json({ error: 'Deliveryman does not exists.' });
    }

    /**
     * Verify file is exists
     */
    const checkFileExists = await File.findByPk(signature_id);

    if (!checkFileExists) {
      return res.status(401).json({ error: 'File does not exists.' });
    }

    const order = await Order.create(req.body);

    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      signature_id: Yup.number(),
      product: Yup.string(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, signature_id, start_date } = req.body;

    /**
     * Verify if recipient exists
     */
    if (recipient_id) {
      const checkRecipientExists = await Recipients.findByPk(recipient_id);

      if (!checkRecipientExists) {
        return res.status(400).json({ error: 'Recipient does not exists.' });
      }
    }

    /**
     * Verify if deliveryman exists
     */
    if (deliveryman_id) {
      const checkDeliverymanExists = await Deliveryman.findByPk(deliveryman_id);

      if (!checkDeliverymanExists) {
        return res.status(400).json({ error: 'Deliveryman does not exists.' });
      }
    }

    /**
     * Verify file is exists
     */
    if (signature_id) {
      const checkFileExists = await File.findByPk(signature_id);

      if (!checkFileExists) {
        return res.status(400).json({ error: 'File does not exists.' });
      }
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: 'There is no Order with this id' });
    }

    /**
     * Date validations of Deliveryman
     */
    if (start_date) {
      const parsedDate = parseISO(start_date);
      const orderToday = await Order.findAll({
        where: {
          start_date: {
            [Op.not]: null,
          },
        },
      });

      if (order.start_date === parsedDate) {
        return res.status(400).json({ error: 'Start date already registered' });
      }

      orderToday.filter(() => {
        return isToday(orderToday.start_date);
      });

      if (orderToday && orderToday.length >= 5) {
        return res.status(400).json({
          error: 'Delivery Man has already made five withdrawals today',
        });
      }

      if (isPast(parsedDate) || !isToday(parsedDate)) {
        return res.status(400).json({ error: 'Invalid date' });
      }

      const minHour = setHours(new Date(), 8);
      const maxHour = setHours(new Date(), 18);

      if (!isBefore(parsedDate, minHour) && !isAfter(parsedDate, maxHour)) {
        return res
          .status(400)
          .json({ error: 'Orders can only be withdrawn between 8am and 6pm' });
      }
    }

    await order.update(req.body);

    return res.json(order);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      end_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: req.body });
    }

    const order = await Order.findByPk(req.params.id);

    const { end_date } = req.body;
    let { signature_id } = order;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.start_date) {
      return res
        .status(400)
        .json({ error: "You can't update this order without starting" });
    }

    const parsedDate = parseISO(end_date);

    if (isPast(parsedDate) || !isToday(parsedDate)) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    if (isBefore(parsedDate, order.start_date)) {
      return res.status(400).json({
        error: 'The delivery date cannot be less than the delivery start date',
      });
    }

    if (req.file) {
      const { originalname: name, filename: path } = req.file;

      const file = await File.create({
        name,
        path,
      });

      signature_id = file.id;
    }

    await order.update({
      end_date,
      signature_id,
    });

    return res.json(order);
  }
}

export default new OrderController();
