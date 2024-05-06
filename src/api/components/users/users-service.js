const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users
 * @returns {Array}
 */

// Pagination
async function getUsers(page_number, page_size, search, sort) {
  const first = (page_number - 1) * page_size;
  const last = page_number * page_size;
  let users = await usersRepository.getUsers();

  if (search) {
    const [type, string] = search.split(':');
    // dalam filtering dibawah ini lebih fleksibel menggunakan ReqExp agar tidak mempedulikan huruf besar atau kecil
    if (type === 'email' && string) {
      const search = new RegExp(string, 'i');
      users = users.filter((user) => search.test(user.email));
      // dalam filtering dibawah ini diperlukan untuk menggunakan huruf kecil
    } else if (type === 'name' && string) {
      const searchString = string.toLowerCase();
      users = users.filter((user) =>
        user.name.toLowerCase().includes(searchString)
      );
    }
  }

  // Fungsi untuk sorting dari descending atau ascending
  if (sort) {
    const [sortBy, sortOrder] = sort.split(':');
    if (sortBy === 'email') {
      users.sort((a, b) => {
        const aValue = a.email.toLowerCase();
        const bValue = b.email.toLowerCase();
        if (sortOrder === 'desc') {
          return bValue.localeCompare(aValue);
        } else {
          return aValue.localeCompare(bValue);
        }
      });
    }
  }

  if (page_number && page_size) {
    const pagination = [];
    for (let i = first; i < last && i < users.length; i++) {
      const user = users[i];
      pagination.push({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    }

    const count = users.length;
    const total_page = Math.ceil(count / page_size);
    const prev_page = page_number > 1;
    const next_page = page_number < total_page;

    return {
      page_number: page_number,
      page_size: page_size,
      count: count,
      total_pages: total_page,
      has_previous_page: prev_page,
      has_next_page: next_page,
      data: pagination,
    };
  }

  const results = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }
  return results;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
