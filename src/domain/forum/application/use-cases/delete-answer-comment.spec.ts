/* eslint-disable @typescript-eslint/no-empty-function */
import { InMemoryAnswerCommentRepository } from 'test/repositories/in-memory-answer-comment-repository'
import { DeleteAnswerCommentUseCase } from './delete-answer-comment'
import { makeAnswerComment } from 'test/factories/make-answer-comment'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'

const makeSut = () => {
  const studentsRepository = new InMemoryStudentsRepository()
  const answerCommentRepository = new InMemoryAnswerCommentRepository(
    studentsRepository,
  )
  const sut = new DeleteAnswerCommentUseCase(answerCommentRepository)
  return {
    sut,
    answerCommentRepository,
  }
}
describe('Delete Answer Comment', () => {
  it('should be able to delete a answer comment', async () => {
    const { sut, answerCommentRepository } = makeSut()
    const answerComment = makeAnswerComment()

    await answerCommentRepository.create(answerComment)

    await sut.execute({
      answerCommentId: answerComment.id.toString(),
      authorId: answerComment.authorId.toString(),
    })

    expect(answerCommentRepository.items).toHaveLength(0)
  })

  it('should not be able to delete another user answer comment', async () => {
    const { sut, answerCommentRepository } = makeSut()
    const answerComment = makeAnswerComment({
      authorId: new UniqueEntityId('author-1'),
    })

    await answerCommentRepository.create(answerComment)

    const result = await sut.execute({
      answerCommentId: answerComment.id.toString(),
      authorId: 'author-2',
    })
    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
