import * as Yup from 'yup';

import File from '../models/File';

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const validationSchema = Yup.object().shape({
      originalname: Yup.string().required(),
    });

    if (!(await validationSchema.isValid(req.file))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new FileController();
