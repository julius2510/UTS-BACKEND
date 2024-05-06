const { Client } = require('../../../models');

/**
 * Count users based on query
 * @param {Object} query
 * @returns {Promise}
 */
async function countBank(query) {
  return Client.countDocuments(query);
}

/**
 * Get users based on query
 * @param {Object} query - fungsi query
 * @param {Object} sorting - fungsi sorting
 * @param {number} skip - fungsi skip
 * @param {number} limit - fungsi limit
 * @returns {Promise}
 */
async function fetchAllClients(query, sorting, skip, limit) {
  return Client.find(query).sort(sorting).skip(skip).limit(limit);
}
// Menampilkan daftar clients
async function fetchAllClients() {
  return Client.find({});
}

// Menampilkan client berdasarkan id
async function fetchClientById(id) {
  return Client.findById(id);
}

// Membuat account client baru
async function createClient(
  name,
  email,
  accountNumber,
  accCode,
  pinNumber,
  ammount
) {
  return Client.create({
    name,
    email,
    accountNumber,
    accCode,
    pinNumber,
    ammount,
  });
}
// Update client
async function updateClient(id, name, email, ammount) {
  return Client.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
        ammount,
      },
    }
  );
}

// Delete account client
async function deleteClient(id) {
  return Client.deleteOne({ _id: id });
}

module.exports = {
  fetchAllClients,
  fetchClientById,
  countBank,
  createClient,
  updateClient,
  deleteClient,
};
