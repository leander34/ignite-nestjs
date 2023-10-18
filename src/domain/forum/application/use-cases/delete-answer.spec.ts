/* eslint-disable @typescript-eslint/no-empty-function */
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { makeAnswer } from 'test/factories/make-answer'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { DeleteAnswerUseCase } from './delete-answer'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachment-repository'
import { makeAnswerAttachment } from 'test/factories/make-answer-attachment'

const makeSut = () => {
  const answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository()
  const answersRepository = new InMemoryAnswersRepository(
    answerAttachmentsRepository,
  )
  const sut = new DeleteAnswerUseCase(answersRepository)
  return {
    sut,
    answersRepository,
    answerAttachmentsRepository,
  }
}
describe('Delete Answer', () => {
  it('should be able to delete a answer', async () => {
    const { sut, answersRepository, answerAttachmentsRepository } = makeSut()
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('answer-1'),
    )
    await answersRepository.create(newAnswer)
    answerAttachmentsRepository.items.push(
      makeAnswerAttachment({
        answerId: newAnswer.id,
        attachmentId: new UniqueEntityId('1'),
      }),
      makeAnswerAttachment({
        answerId: newAnswer.id,
        attachmentId: new UniqueEntityId('2'),
      }),
    )
    await sut.execute({
      answerId: 'answer-1',
      authorId: 'author-1',
    })

    expect(answersRepository.items).toHaveLength(0)
    expect(answerAttachmentsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a answer from another user', async () => {
    const { sut, answersRepository } = makeSut()
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('answer-1'),
    )
    await answersRepository.create(newAnswer)

    const result = await sut.execute({
      authorId: 'author-2',
      answerId: 'answer-1',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
