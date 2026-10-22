import { Table, Column, Model, DataType } from 'sequelize-typescript';

/** Tabla pivote `model_has_roles` de spatie/laravel-permission. */
@Table({ tableName: 'model_has_roles', timestamps: false })
export class ModelHasRole extends Model {
  @Column({ type: DataType.BIGINT.UNSIGNED, primaryKey: true })
  declare role_id: number;

  @Column({ type: DataType.STRING(255), primaryKey: true })
  declare model_type: string;

  @Column({ type: DataType.BIGINT.UNSIGNED, primaryKey: true })
  declare model_id: number;
}
