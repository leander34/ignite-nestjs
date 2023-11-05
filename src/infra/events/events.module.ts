import { OnAnswerCommentCreated } from '@/domain/notification/application/subscribers/on-answer-comment-created'
import { OnAnswerCreated } from '@/domain/notification/application/subscribers/on-asnwer-created'
import { OnQuestionBestAnswerChosen } from '@/domain/notification/application/subscribers/on-question-best-answer-chosen'
import { OnQuestionCommentCreated } from '@/domain/notification/application/subscribers/on-question-comment-created'
import { ReadNotificationUseCase } from '@/domain/notification/application/use-cases/read-notification'
import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule],
  providers: [
    OnAnswerCommentCreated,
    OnAnswerCreated,
    OnQuestionBestAnswerChosen,
    OnQuestionCommentCreated,
    SendNotificationUseCase,
    ReadNotificationUseCase,
  ],
})
export class EventsModule {}
