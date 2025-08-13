import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('blob_data')
export class BlobData {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'bytea' })
  data: Buffer;
} 