import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Licitacion } from './licitacion.model';

/** Estado de una fase del procedimiento. */
export const ESTADO_FASE = { CONCLUIDO: '0', EN_PROCESO: '1', POR_REALIZAR: '2' } as const;

/** Procedimiento (tabla `sicoplem_irp_lpnp`): conserva el nombre y las columnas de la base de Laravel. */
@Table({
  tableName: 'sicoplem_irp_lpnp',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
})
export class Sicoplem extends Model {
  @Column({ type: DataType.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => Licitacion)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare tipo: number;

  @BelongsTo(() => Licitacion, { foreignKey: 'tipo', constraints: false })
  declare tipos: Licitacion;

  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare nombre: string | null;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare fecha: string | null;

  @Column({ type: DataType.TIME, allowNull: true })
  declare hora: string | null;

  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare dia_uno: string | null;
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare dia_dos: string | null;
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare dia_tres: string | null;
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare dia_cuatro: string | null;

  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare hora_uno: string | null;
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare hora_dos: string | null;
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare hora_tres: string | null;
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare hora_cuatro: string | null;

  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare lugar_uno: string | null;
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare lugar_dos: string | null;
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare lugar_tres: string | null;
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare lugar_cuatro: string | null;

  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare radio_uno: string | null;
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare radio_dos: string | null;
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare radio_tres: string | null;
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare radio_cuatro: string | null;

  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare path: string | null;

  /** Convocatoria (o "Documento" en adjudicación directa). */
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare documento: string | null;

  /** Documento de la venta de bases. */
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare documento_base: string | null;

  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare path_ja: string | null;
  /** Documento de la junta de aclaraciones. */
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare documento_ja: string | null;

  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare path_pap: string | null;
  /** Documento de la presentación y apertura de propuestas. */
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare documento_pap: string | null;

  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare path_ef: string | null;
  /** Documento de la emisión de fallo. */
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare documento_ef: string | null;

  /** Contrato (un archivo, o un .zip cuando se suben varios). */
  @Column({ type: DataType.TEXT('long'), allowNull: true })
  declare path_contrato: string | null;
}
