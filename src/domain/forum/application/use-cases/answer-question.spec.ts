/* eslint-disable @typescript-eslint/no-empty-function */
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AnswerQuestionUseCase } from './answer-question'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachment-repository'

const makeSut = () => {
  const answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository()
  const answersRepository = new InMemoryAnswersRepository(
    answerAttachmentsRepository,
  )
  const sut = new AnswerQuestionUseCase(answersRepository)
  return {
    sut,
    answersRepository,
    answerAttachmentsRepository,
  }
}
describe('Answer Question', () => {
  it('should be able to create an answer', async () => {
    const { sut, answersRepository } = makeSut()
    const result = await sut.execute({
      questionId: '1',
      authorId: '1',
      content: 'Nova resposta',
      attachmentsIds: ['1', '2'],
    })

    expect(result.isRight()).toBeTruthy()
    expect(answersRepository.items[0]).toEqual(result.value?.answer)
    expect(answersRepository.items[0].attachments.getItems()).toHaveLength(2)
    expect(answersRepository.items[0].attachments.getItems()).toEqual([
      expect.objectContaining({
        attachmentId: new UniqueEntityId('1'),
      }),
      expect.objectContaining({
        attachmentId: new UniqueEntityId('2'),
      }),
    ])
  })

  it('should persist attachments when create a new answer', async () => {
    const { sut, answerAttachmentsRepository } = makeSut()
    const result = await sut.execute({
      questionId: '1',
      authorId: '1',
      content: 'Conteúdo da pergunta',
      attachmentsIds: ['1', '2'],
    })

    expect(result.isRight()).toBeTruthy()
    expect(answerAttachmentsRepository.items).toHaveLength(2)
    expect(answerAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attachmentId: new UniqueEntityId('1'),
        }),
        expect.objectContaining({
          attachmentId: new UniqueEntityId('2'),
        }),
      ]),
    )
  })
})
