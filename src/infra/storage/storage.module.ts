import { Uploader } from '@/domain/forum/application/storage/uploader'
import { Module } from '@nestjs/common'
import { TabiStorage } from './tebi-storage'
import { EnvModule } from '../env/env.module'

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: Uploader,
      useClass: TabiStorage,
    },
  ],

  exports: [Uploader],
})
export class StorageModule {}
