import { makeAnswer } from 'test/factories/make-answer'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachment-repository'
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachment-repository'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { makeQuestion } from 'test/factories/make-question'
import { waitFor } from 'test/utils/wait-for'
import { OnQuestionBestAnswerChosen } from './on-question-best-answer-chosen'
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

  new OnQuestionBestAnswerChosen(answersRepository, sendNotificationUseCase)

  return {
    answersRepository,
    questionsRepository,
    sendNotificationExecuteSpy,
  }
}
describe('On Question Best Answer Chosen', () => {
  it('should send a notification when question has new best answer chosen', async () => {
    const {
      answersRepository,
      questionsRepository,
      sendNotificationExecuteSpy,
    } = makeSut()

    const question = makeQuestion()
    const answer = makeAnswer({ questionId: question.id })

    await questionsRepository.create(question)
    await answersRepository.create(answer)

    question.bestAnswerId = answer.id

    await questionsRepository.save(question)

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled()
    })
  })
})
