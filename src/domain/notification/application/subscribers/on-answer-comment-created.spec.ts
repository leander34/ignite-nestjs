import { makeAnswer } from 'test/factories/make-answer'
import { makeAnswerComment } from 'test/factories/make-answer-comment'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachment-repository'
import { InMemoryAnswerCommentRepository } from 'test/repositories/in-memory-answer-comment-repository'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { OnAnswerCommentCreated } from './on-answer-comment-created'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'

const makeSut = () => {
  const answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository()
  const answerRepository = new InMemoryAnswersRepository(
    answerAttachmentsRepository,
  )
  const studentsRepository = new InMemoryStudentsRepository()
  const answerCommentRepository = new InMemoryAnswerCommentRepository(
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

  new OnAnswerCommentCreated(answerRepository, sendNotificationUseCase)
  return {
    answerRepository,
    answerCommentRepository,
    sendNotificationExecuteSpy,
  }
}

describe('On Answer Comment Created', () => {
  it('should be able to send a notification when a new answer comment is created', async () => {
    const {
      answerRepository,
      answerCommentRepository,
      sendNotificationExecuteSpy,
    } = makeSut()
    const answer = makeAnswer()
    const answerComment = makeAnswerComment({ answerId: answer.id })

    await answerRepository.create(answer)
    await answerCommentRepository.create(answerComment)

    expect(sendNotificationExecuteSpy).toHaveBeenCalled()
  })
})
