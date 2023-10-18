import { makeAnswer } from 'test/factories/make-answer'
import { OnAnswerCreated } from './on-asnwer-created'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachment-repository'
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachment-repository'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { makeQuestion } from 'test/factories/make-question'
import { waitFor } from 'test/utils/wait-for'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'

const makeSut = () => {
  const questionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepository()
  const attachmentsRepository = new InMemoryAttachmentsRepository()
  const studentsRepository = new InMemoryStudentsRepository()

  const questionsRepository = new InMemoryQuestionsRepository(
    questionAttachmentsRepository,
    attachmentsRepository,
    studentsRepository,
  )
  const answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository()
  const answersRepository = new InMemoryAnswersRepository(
    answerAttachmentsRepository,
  )

  const notificationsRepository = new InMemoryNotificationsRepository()

  const sendNotificationUseCase = new SendNotificationUseCase(
    notificationsRepository,
  )

  const sendNotificationExecuteSpy = vi.spyOn(
    sendNotificationUseCase,
    'execute',
  )

  new OnAnswerCreated(questionsRepository, sendNotificationUseCase)

  return {
    answersRepository,
    questionsRepository,
    sendNotificationExecuteSpy,
  }
}
describe('On Answer Created', () => {
  it('should send a notification when an answer is created', async () => {
    const {
      answersRepository,
      questionsRepository,
      sendNotificationExecuteSpy,
    } = makeSut()

    const question = makeQuestion()
    const answer = makeAnswer({ questionId: question.id })

    await questionsRepository.create(question)
    await answersRepository.create(answer)

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled()
    })
  })
})
