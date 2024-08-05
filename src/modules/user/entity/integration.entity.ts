import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ProviderEnum } from '../../common/enum/provider.enum';
import { CommonEntity } from '../../common/entity/common';
import { UserEntity } from '../entity/user.entity';

@Entity({
  name: 'integration',
})
export class IntegrationEntity extends CommonEntity {
  @Index()
  @ManyToOne(() => UserEntity, (user) => user.integration, { nullable: true })
  // @JoinColumn({ name: 'byUserId' })
  byUser: string;

  @Column({ type: 'text', unique: true })
  integrationId: string;

  @Column({ type: 'enum', enum: ProviderEnum })
  provider: string;
}
