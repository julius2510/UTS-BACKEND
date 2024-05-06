const joi = require('joi');

module.exports = {
  createClient: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      accCode: joi.string().required().label('Access Code'),
      pinNumber: joi.number().required().label('PIN'),
      ammount: joi.number().required().label('Balance'),
    },
  },

  updateClient: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      accCode: joi.string().required().label('Access Code'),
      pinNumber: joi.number().required().label('PIN'),
      ammount: joi.number().required().label('Balance'),
    },
  },

  deleteClient: {
    body: {
      clientId: joi.number().required().label('Client ID'),
    },
  },
};
