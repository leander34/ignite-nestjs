/* eslint-disable @typescript-eslint/no-empty-function */
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CreateQuestionUseCase } from './create-question'
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachment-repository'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'

const makeSut = () => {
  const questionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepository()
  const studentsRepository = new InMemoryStudentsRepository()
  const attachmentsRepository = new InMemoryAttachmentsRepository()
  const questionsRepository = new InMemoryQuestionsRepository(
    questionAttachmentsRepository,
    attachmentsRepository,
    studentsRepository,
  )
  const sut = new CreateQuestionUseCase(questionsRepository)
  return {
    sut,
    questionsRepository,
    questionAttachmentsRepository,
  }
}
describe('Create Question', () => {
  it('should be able to create a question', async () => {
    const { sut, questionsRepository } = makeSut()
    const result = await sut.execute({
      authorId: '1',
      title: 'Nova pergunta',
      content: 'Conteúdo da pergunta',
      attachmentsIds: ['1', '2'],
    })

    expect(result.isRight()).toBeTruthy()
    expect(questionsRepository.items[0]).toEqual(result.value?.question)
    expect(questionsRepository.items[0].attachments.getItems()).toHaveLength(2)
    expect(questionsRepository.items[0].attachments.getItems()).toEqual([
      expect.objectContaining({
        attachmentId: new UniqueEntityId('1'),
      }),
      expect.objectContaining({
        attachmentId: new UniqueEntityId('2'),
      }),
    ])
  })

  it('should persist attachments when create a new question', async () => {
    const { sut, questionAttachmentsRepository } = makeSut()
    const result = await sut.execute({
      authorId: '1',
      title: 'Nova pergunta',
      content: 'Conteúdo da pergunta',
      attachmentsIds: ['1', '2'],
    })

    expect(result.isRight()).toBeTruthy()
    expect(questionAttachmentsRepository.items).toHaveLength(2)
    expect(questionAttachmentsRepository.items).toEqual(
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
