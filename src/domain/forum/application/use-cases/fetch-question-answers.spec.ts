/* eslint-disable @typescript-eslint/no-empty-function */
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { FetchQuestionAnswersUseCase } from './fetch-question-answers'
import { makeAnswer } from 'test/factories/make-answer'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachment-repository'

const makeSut = () => {
  const answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository()
  const answersRepository = new InMemoryAnswersRepository(
    answerAttachmentsRepository,
  )
  const sut = new FetchQuestionAnswersUseCase(answersRepository)
  return {
    sut,
    answersRepository,
  }
}
describe('Fetch Question Answers', () => {
  it('should be able to fetch question answers', async () => {
    const { sut, answersRepository } = makeSut()
    await answersRepository.create(
      makeAnswer({ questionId: new UniqueEntityId('question-1') }),
    )
    await answersRepository.create(
      makeAnswer({ questionId: new UniqueEntityId('question-1') }),
    )
    await answersRepository.create(
      makeAnswer({ questionId: new UniqueEntityId('question-1') }),
    )

    const result = await sut.execute({
      questionId: 'question-1',
      page: 1,
    })

    expect(result.value?.answers).toHaveLength(3)
  })

  it('should be able to fetch paginated recent questions', async () => {
    const { sut, answersRepository } = makeSut()
    for (let i = 1; i <= 22; i++) {
      await answersRepository.create(
        makeAnswer({ questionId: new UniqueEntityId('question-1') }),
      )
    }
    const result = await sut.execute({
      questionId: 'question-1',
      page: 2,
    })
    expect(result.value?.answers).toHaveLength(2)
  })
})
