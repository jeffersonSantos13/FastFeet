import Sequelize from 'sequelize';

import User from '../app/models/Users';
import Recipient from '../app/models/Recipients';
import File from '../app/models/File';
import Deliverymans from '../app/models/Deliverymans';

import databaseConfig from '../config/database';

const models = [User, Recipient, File, Deliverymans];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
