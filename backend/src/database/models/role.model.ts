import { Table, Column, Model, DataType } from 'sequelize-typescript';

/** Tabla `roles` de spatie/laravel-permission. */
@Table({ tableName: 'roles', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class Role extends Model {
  @Column({ type: DataType.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(255), allowNull: false, defaultValue: 'web' })
  declare guard_name: string;
}
