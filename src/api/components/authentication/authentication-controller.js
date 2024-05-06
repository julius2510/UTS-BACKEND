const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

// Soal nomor 2
const token_login = {};

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    // untuk memeriksa apakah email memiliki percobaan login yang gagal sebelumnya
    if (token_login[email] && token_login[email].attempts >= 5) {
      // Cek apakah sudah melewati 30 menit sejak percobaan terakhir
      const thirtyMinutesAgo = new Date() - token_login[email].lastAttempt;
      if (thirtyMinutesAgo < 30 * 60 * 1000) {
        throw errorResponder(
          errorTypes.FORBIDDEN,
          'Too many failed login attempts. Please try again 30 minutes later.'
        );
      } else {
        // percobaan login setelah 30 menit
        delete token_login[email];
      }
    }

    const login_success = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!login_success) {
      if (!token_login[email]) {
        token_login[email] = {
          attempts: 1,
          lastAttempt: new Date(),
        };
      } else {
        token_login[email].attempts += 1;
        token_login[email].lastAttempt = new Date();
      }
      // Menampilkan berapa banyak percobaan gagal login
      const attemptNumber = token_login[email].attempts;
      let errorMessage = `gagal login. Attempt = ${attemptNumber}`;
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, errorMessage);
    }

    // Hapus login attempt data setelah success login
    delete token_login[email];

    return response.status(200).json(login_success);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
