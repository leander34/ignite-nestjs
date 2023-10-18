import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { DomainEvent } from '@/core/events/domain-event'
import { QuestionComment } from '../entities/question-comment'

export class QuestionCommentCreatedEvent implements DomainEvent {
  ocurredAt: Date
  questionComment: QuestionComment
  constructor(questionComment: QuestionComment) {
    this.questionComment = questionComment
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.questionComment.id
  }
}
