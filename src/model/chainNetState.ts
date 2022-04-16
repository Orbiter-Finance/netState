import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm'

@Entity()
export class ChainNetState {
  @PrimaryGeneratedColumn()
  id: number

  @Column('int')
  chainID: number

  @Column('bigint')
  @Index()
  created_at: number

  @Column()
  net_state?: boolean

  @Column()
  ten_minite_net_state?: boolean

  @Column()
  last_hash?: string

  @Column()
  tx_err_count?: number

  @Column()
  last_block_num?: number

  @Column()
  block_err_count?: number
}
