import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ProviderEnum } from '../../common/enum/provider.enum';
import { UserEntity } from './user.entity';
import { CommonEntity } from 'src/modules/common/entity/common';

@Entity({
  name: 'integration',
})
export class IntegrationEntity extends CommonEntity {
  @Index()
  @ManyToOne(() => UserEntity, (user) => user.integration)
  @JoinColumn({ name: 'byUserId' })
  byUser: string;

  @Column({ type: 'text', unique: true })
  integrationId: string;

  @Column({ type: 'enum', enum: ProviderEnum })
  provider: string;
}
