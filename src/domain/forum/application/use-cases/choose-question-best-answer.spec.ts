/* eslint-disable @typescript-eslint/no-empty-function */
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { makeAnswer } from 'test/factories/make-answer'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ChooseQuestionBestAnswerUseCase } from './choose-question-best-answer'
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { makeQuestion } from 'test/factories/make-question'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachment-repository'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachment-repository'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'

const makeSut = () => {
  const answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository()
  const questionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepository()
  const studentsRepository = new InMemoryStudentsRepository()
  const attachmentsRepository = new InMemoryAttachmentsRepository()
  const questionsRepository = new InMemoryQuestionsRepository(
    questionAttachmentsRepository,
    attachmentsRepository,
    studentsRepository,
  )

  const answersRepository = new InMemoryAnswersRepository(
    answerAttachmentsRepository,
  )
  const sut = new ChooseQuestionBestAnswerUseCase(
    questionsRepository,
    answersRepository,
  )
  return {
    sut,
    answersRepository,
    questionsRepository,
  }
}
describe('Choose Question Best Answer', () => {
  it('should be able to choose the question best answer', async () => {
    const { sut, questionsRepository, answersRepository } = makeSut()
    const question = makeQuestion()
    const answer = makeAnswer({
      questionId: question.id,
    })
    await questionsRepository.create(question)
    await answersRepository.create(answer)

    await sut.execute({
      answerId: answer.id.toString(),
      authorId: question.authorId.toString(),
    })

    expect(questionsRepository.items[0].bestAnswerId).toEqual(answer.id)
  })

  it('should not be able to choose another user question best answer', async () => {
    const { sut, questionsRepository, answersRepository } = makeSut()
    const question = makeQuestion({
      authorId: new UniqueEntityId('author-1'),
    })
    const answer = makeAnswer({
      questionId: question.id,
    })
    await questionsRepository.create(question)
    await answersRepository.create(answer)

    const result = await sut.execute({
      authorId: 'author-2',
      answerId: answer.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
