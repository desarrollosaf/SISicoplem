'use strict';

const bcrypt = require('bcryptjs');

/**
 * Crea un administrador para una base vacía (desarrollo). No hace nada si ya existe o si falta
 * SEED_ADMIN_PASSWORD:
 *   SEED_ADMIN_EMAIL=admin@ejemplo.gob.mx SEED_ADMIN_PASSWORD=... npm run seed
 */
module.exports = {
  async up(queryInterface) {
    const email = process.env.SEED_ADMIN_EMAIL || 'administrador@legislativoedomex.gob.mx';
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!password) return;

    const [existentes] = await queryInterface.sequelize.query('SELECT id FROM users WHERE email = ?', {
      replacements: [email],
    });
    if (existentes.length) return;

    const ahora = new Date();
    await queryInterface.bulkInsert('users', [
      {
        name: 'Administrador',
        email,
        password: bcrypt.hashSync(password, 10),
        created_at: ahora,
        updated_at: ahora,
      },
    ]);
    const [[usuario]] = await queryInterface.sequelize.query('SELECT id FROM users WHERE email = ?', {
      replacements: [email],
    });
    const [[rol]] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name = 'Administrador'");
    await queryInterface.bulkInsert('model_has_roles', [
      { role_id: rol.id, model_type: 'App\\Models\\User', model_id: usuario.id },
    ]);
  },

  async down() {},
};
