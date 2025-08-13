import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('blobs')
export class Blob {
  @PrimaryGeneratedColumn('uuid')
  internalId: string;

  @Column({ unique: true })
  id: string;

  @Column()
  size: number;

  @Column()
  storageType: string;

  @Column()
  storageLocation: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 