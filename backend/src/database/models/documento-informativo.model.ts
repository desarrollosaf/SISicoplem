import { Table, Column, Model, DataType } from 'sequelize-typescript';

/** Documentos que se publican en la landing (programas anuales y catálogo). */
@Table({
  tableName: 'documentos_informativos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
})
export class DocumentoInformativo extends Model {
  @Column({ type: DataType.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true })
  declare id: number;

  /** 1 = Programa anual de adquisiciones, 2 = de arrendamientos, 3 = Catálogo de bienes y servicios. */
  @Column({ type: DataType.TINYINT, allowNull: false })
  declare tipo: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare path: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare activo: boolean;
}
