'use strict';

/** Roles y tipos de procedimiento. Solo inserta lo que falte, así que es seguro sobre la base actual. */
const ROLES = ['Administrador', 'Invitado'];

const TIPOS_PROCEDIMIENTO = [
  'Licitación Pública Nacional Presencial',
  'Invitación Restringida Presencial',
  'Adjudicación Directa',
  'Adjudicación directa LPNP/IRP',
  'Arrendamiento',
  'Enajenaciones',
  'Donaciones',
  'Enajenación Directa',
];

module.exports = {
  async up(queryInterface) {
    const ahora = new Date();
    const [roles] = await queryInterface.sequelize.query('SELECT name FROM roles');
    const rolesExistentes = roles.map((r) => r.name);
    const nuevosRoles = ROLES.filter((n) => !rolesExistentes.includes(n)).map((name) => ({
      name,
      guard_name: 'web',
      created_at: ahora,
      updated_at: ahora,
    }));
    if (nuevosRoles.length) await queryInterface.bulkInsert('roles', nuevosRoles);

    const [tipos] = await queryInterface.sequelize.query('SELECT COUNT(*) AS total FROM licitacions');
    if (Number(tipos[0].total) === 0) {
      await queryInterface.bulkInsert(
        'licitacions',
        TIPOS_PROCEDIMIENTO.map((nombre) => ({ nombre, activo: '1', created_at: ahora, updated_at: ahora })),
      );
    }
  },

  async down() {},
};
