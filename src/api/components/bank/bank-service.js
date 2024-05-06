const clientsRepository = require('./bank-repository');
const { hashPassword } = require('../../../utils/password');

async function fetchAllClients() {
  const clients = await clientsRepository.fetchAllClients();

  const results = [];
  for (let i = 0; i < clients.length; i += 1) {
    const client = clients[i];
    results.push({
      id: client.id,
      name: client.name,
      email: client.email,
      accountNumber: client.accountNumber,
      accCode: client.accCode,
      pinNumber: client.pinNumber,
      ammount: client.ammount,
    });
  }

  return results;
}

////// fungsi untuk pagination penambahan buat nomor 3
/** 3
 * Get list of users
 * @param {integer} pageNumber - banyaknya page
 * @param {integer} pageSize - ukuran dari isi page
 * @param {string} search - search untuk mencari nama dan email dengan ascending dan descending
 * @param {string} sort - mensorting dengan descending atau ascending
 * @returns {Object}
 */
async function fetchAllClients(page, pageSize, search, sort) {
  let query = {};

  if (search) {
    const [EmailName, searchKey] = search.split(':');
    if (EmailName === 'name') {
      query[EmailName] = { $regex: searchKey, $options: 'i' };
    }
  }

  let sorting = { email: 1 };
  if (sort) {
    const [sortName, sortsc] = sort.split(':');
    if (sortName === 'email' || sortName === 'name')
      sortsc === 'asc' || sortsc === 'desc';
    {
      sorting[sortName] = sortsc === 'desc' ? -1 : 1;
    }
  }

  const count = await clientsRepository.countBank(query);
  const skip = (page - 1) * pageSize;
  const clients = await clientsRepository.fetchAllClients(
    query,
    sorting,
    skip,
    pageSize
  );
  const total_pages = Math.ceil(count / pageSize);
  const has_previous_page = page > 1;
  const has_next_page = page < total_pages;

  return {
    page_number: page,
    page_size: pageSize,
    count: clients.length,
    total_pages,
    has_previous_page,
    has_next_page,
    data: clients,
  };
}
async function fetchClientById(id) {
  const client = await clientsRepository.fetchClientById(id);

  if (!client) {
    return null;
  }

  return {
    id: client.id,
    name: client.name,
    email: client.email,
    accountNumber: client.accountNumber,
    accCode: client.accCode,
    pinNumber: client.pinNumber,
    ammount: client.ammount,
  };
}

async function createClient(
  name,
  email,
  accountNumber,
  accCode,
  pinNumber,
  ammount
) {
  const stringPin = String(pinNumber);

  //Hash access code dan pin
  const hashedAccessCode = await hashPassword(accCode);
  const hashedPin = await hashPassword(stringPin);

  try {
    await clientsRepository.createClient(
      name,
      email,
      accountNumber,
      hashedAccessCode,
      hashedPin,
      ammount
    );
  } catch (err) {
    return null;
  }

  return true;
}

async function updateClient(id) {
  const client = await clientsRepository.fetchClientById(id);

  if (!client) {
    return null;
  }

  try {
    await clientsRepository.updateClient(id);
  } catch (err) {
    return null;
  }

  return true;
}

async function deleteClient(id) {
  const client = await clientsRepository.fetchClientById(id);

  if (!client) {
    return null;
  }

  try {
    await clientsRepository.deleteClient(id);
  } catch (err) {
    return null;
  }

  return true;
}

async function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateUniqueAccountNumber() {
  const min = 10000000;
  const max = 99999999;
  let accountNumber;

  do {
    accountNumber = getRandomNumber(min, max);
    isUnique = true;
  } while (!isUnique);

  return accountNumber;
}

module.exports = {
  fetchAllClients,
  fetchClientById,
  createClient,
  updateClient,
  deleteClient,
  generateUniqueAccountNumber,
};
