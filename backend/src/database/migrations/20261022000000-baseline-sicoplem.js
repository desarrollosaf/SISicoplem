'use strict';

/**
 * Línea base del esquema que ya existe en producción (creado por Laravel).
 *
 * Es idempotente: si la tabla ya existe (base actual conservada) no la toca; solo crea lo que
 * falte, para poder levantar una base vacía en desarrollo con `npm run migrate`.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const existentes = (await queryInterface.showAllTables()).map((t) =>
      String(typeof t === 'string' ? t : t.tableName).toLowerCase(),
    );
    const crear = async (nombre, columnas, opciones) => {
      if (existentes.includes(nombre)) return;
      await queryInterface.createTable(nombre, columnas, opciones);
    };

    const id = { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false };
    const timestamps = {
      created_at: { type: Sequelize.DATE, allowNull: true },
      updated_at: { type: Sequelize.DATE, allowNull: true },
    };
    const largo = { type: Sequelize.TEXT('long'), allowNull: true };

    await crear('users', {
      id,
      name: { type: Sequelize.STRING(255), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      email_verified_at: { type: Sequelize.DATE, allowNull: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      remember_token: { type: Sequelize.STRING(100), allowNull: true },
      ...timestamps,
    });

    await crear('roles', {
      id,
      name: { type: Sequelize.STRING(255), allowNull: false },
      guard_name: { type: Sequelize.STRING(255), allowNull: false, defaultValue: 'web' },
      ...timestamps,
    });

    await crear('model_has_roles', {
      role_id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
      model_type: { type: Sequelize.STRING(255), primaryKey: true, allowNull: false },
      model_id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, allowNull: false },
    });

    await crear('licitacions', {
      id,
      nombre: { type: Sequelize.STRING(255), allowNull: false },
      activo: { type: Sequelize.STRING(255), allowNull: false, defaultValue: '1' },
      ...timestamps,
    });

    await crear('sicoplem_irp_lpnp', {
      id,
      tipo: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      nombre: largo,
      fecha: { type: Sequelize.DATEONLY, allowNull: true },
      hora: { type: Sequelize.TIME, allowNull: true },
      dia_uno: largo,
      dia_dos: largo,
      dia_tres: largo,
      dia_cuatro: largo,
      hora_uno: largo,
      hora_dos: largo,
      hora_tres: largo,
      hora_cuatro: largo,
      lugar_uno: largo,
      lugar_dos: largo,
      lugar_tres: largo,
      lugar_cuatro: largo,
      radio_uno: largo,
      radio_dos: largo,
      radio_tres: largo,
      radio_cuatro: largo,
      path: largo,
      documento_base: largo,
      documento: largo,
      path_ja: largo,
      documento_ja: largo,
      path_pap: largo,
      documento_pap: largo,
      path_ef: largo,
      documento_ef: largo,
      path_contrato: largo,
      ...timestamps,
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await crear('documentos_informativos', {
      id,
      tipo: { type: Sequelize.TINYINT(1), allowNull: false },
      path: { type: Sequelize.STRING(255), allowNull: false },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      ...timestamps,
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });
  },

  // La línea base no se deshace: borraría la información de producción.
  async down() {},
};
