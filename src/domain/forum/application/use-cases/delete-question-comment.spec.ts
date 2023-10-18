/* eslint-disable @typescript-eslint/no-empty-function */
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository'
import { DeleteQuestionCommentUseCase } from './delete-question-comment'
import { makeQuestionComment } from 'test/factories/make-question-comment'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'

const makeSut = () => {
  const studentsRepository = new InMemoryStudentsRepository()

  const questionCommentsRepository = new InMemoryQuestionCommentsRepository(
    studentsRepository,
  )
  const sut = new DeleteQuestionCommentUseCase(questionCommentsRepository)
  return {
    sut,
    questionCommentsRepository,
  }
}
describe('Delete Question Comment', () => {
  it('should be able to delete a question comment', async () => {
    const { sut, questionCommentsRepository } = makeSut()
    const questionComment = makeQuestionComment()

    await questionCommentsRepository.create(questionComment)

    await sut.execute({
      questionCommentId: questionComment.id.toString(),
      authorId: questionComment.authorId.toString(),
    })

    expect(questionCommentsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete another user question comment', async () => {
    const { sut, questionCommentsRepository } = makeSut()
    const questionComment = makeQuestionComment({
      authorId: new UniqueEntityId('author-1'),
    })

    await questionCommentsRepository.create(questionComment)
    const result = await sut.execute({
      questionCommentId: questionComment.id.toString(),
      authorId: 'author-2',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
