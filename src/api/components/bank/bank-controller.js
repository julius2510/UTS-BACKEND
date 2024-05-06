const clientsService = require('./bank-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
// const untuk generate angka acak
const { generateUniqueAccountNumber } = require('./bank-service');

// menambahkan const pageNumber, pageSize, search, dan sort untuk pagination untuk soal nomor 3
/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function fetchAllClients(request, response, next) {
  try {
    const { page_number, page_size, search, sort } = request.query;
    const clients = await clientsService.fetchAllClients(
      page_number,
      page_size,
      search,
      sort
    );
    return response.status(200).json(clients);
  } catch (error) {
    return next(error);
  }
}

async function fetchClientById(request, response, next) {
  try {
    const client = await clientsService.fetchClientById(request.params.id);

    if (!client) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Client not found');
    }

    return response.status(200).json(client);
  } catch (error) {
    return next(error);
  }
}

async function createClient(request, response, next) {
  try {
    const { name, email, accCode, pinNumber, ammount } = request.body;

    if (!name || !email || !accCode || !pinNumber || !ammount) {
      throw errorResponder(
        errorTypes.BAD_REQUEST,
        'Missing required fields for client registration'
      );
    }

    const accountNumber = await generateUniqueAccountNumber();

    const success = await clientsService.createClient(
      name,
      email,
      accountNumber,
      accCode,
      pinNumber,
      ammount
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to register new client'
      );
    }

    return response.status(200).json({
      message: 'Client registration successful',
      data: {
        name: name,
        email: email,
        Account_Number: accountNumber,
        Access_Code: accCode,
        Pin_Number: pinNumber,
        Ammount_of_Balance: ammount,
      },
    });
  } catch (error) {
    return next(error);
  }
}

// Fungsi untuk update data client
async function updateClient(request, response, next) {
  try {
    const name = request.body;
    const email = request.body;
    const ammount = request.body;
    const id = request.params.id;

    if (!name && !email && !ammount) {
      throw errorResponder(
        errorTypes.BAD_REQUEST,
        'No data provided for client update'
      );
    }

    const success = await clientsService.updateClient(id, name, email, ammount);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update client info'
      );
    }

    return response.status(200).json({
      message: 'Client info updated successfully',
      
    });
  } catch (error) {
    return next(error);
  }
}

// Fungsi untuk menghapus akun client
async function deleteClient(request, response, next) {
  try {
    const id = request.params.id;

    const success = await clientsService.deleteClient(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete client'
      );
    }

    return response.status(200).json({
      id,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  fetchAllClients,
  fetchClientById,
  createClient,
  updateClient,
  deleteClient,
};
