import { Table, Column, Model, DataType, BelongsToMany } from 'sequelize-typescript';
import { Role } from './role.model';
import { ModelHasRole } from './model-has-role.model';

/** Tabla `users` de Laravel: se conserva tal cual para que sigan entrando con su contraseña. */
@Table({ tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class User extends Model {
  @Column({ type: DataType.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare email_verified_at: Date | null;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare password: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare remember_token: string | null;

  @BelongsToMany(() => Role, {
    through: { model: () => ModelHasRole, scope: { model_type: 'App\\Models\\User' } },
    foreignKey: 'model_id',
    otherKey: 'role_id',
    constraints: false,
  })
  declare roles: Role[];
}
