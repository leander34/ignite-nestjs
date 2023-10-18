import { makeQuestion } from 'test/factories/make-question'
import { makeQuestionComment } from 'test/factories/make-question-comment'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachment-repository'
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository'
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { OnQuestionCommentCreated } from './on-question-comment-created'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'

const makeSut = () => {
  const questionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepository()
  const attachmentsRepository = new InMemoryAttachmentsRepository()
  const studentsRepository = new InMemoryStudentsRepository()
  const questionRepository = new InMemoryQuestionsRepository(
    questionAttachmentsRepository,
    attachmentsRepository,
    studentsRepository,
  )

  const questionCommentRepository = new InMemoryQuestionCommentsRepository(
    studentsRepository,
  )

  const notificationsRepository = new InMemoryNotificationsRepository()
  const sendNotificationUseCase = new SendNotificationUseCase(
    notificationsRepository,
  )

  const sendNotificationExecuteSpy = vi.spyOn(
    sendNotificationUseCase,
    'execute',
  )

  new OnQuestionCommentCreated(questionRepository, sendNotificationUseCase)
  return {
    questionRepository,
    questionCommentRepository,
    sendNotificationExecuteSpy,
  }
}

describe('On Question Comment Created', () => {
  it('should be able to send a notification when a new question comment is created', async () => {
    const {
      questionRepository,
      questionCommentRepository,
      sendNotificationExecuteSpy,
    } = makeSut()
    const question = makeQuestion()
    const questionComment = makeQuestionComment({ questionId: question.id })

    await questionRepository.create(question)
    await questionCommentRepository.create(questionComment)

    expect(sendNotificationExecuteSpy).toHaveBeenCalled()
  })
})
