import { Table, Column, Model, DataType } from 'sequelize-typescript';

/** Tipos de procedimiento (Licitación Pública, Invitación Restringida, Adjudicación Directa…). */
@Table({ tableName: 'licitacions', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class Licitacion extends Model {
  @Column({ type: DataType.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.STRING(255), allowNull: false, defaultValue: '1' })
  declare activo: string;
}
