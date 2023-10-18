/* eslint-disable @typescript-eslint/no-empty-function */
import { FetchAnswersCommentsUseCase } from './fetch-answer-comments'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { InMemoryAnswerCommentRepository } from 'test/repositories/in-memory-answer-comment-repository'
import { makeAnswerComment } from 'test/factories/make-answer-comment'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'
import { makeStudent } from 'test/factories/make-student'

const makeSut = () => {
  const studentsRepository = new InMemoryStudentsRepository()
  const answerCommentRepository = new InMemoryAnswerCommentRepository(
    studentsRepository,
  )
  const sut = new FetchAnswersCommentsUseCase(answerCommentRepository)
  return {
    sut,
    answerCommentRepository,
    studentsRepository,
  }
}
describe('Fetch Answer Comments', () => {
  it('should be able to fetch answer comments', async () => {
    const { sut, answerCommentRepository, studentsRepository } = makeSut()
    const student = makeStudent({
      name: 'John Doe',
    })

    studentsRepository.items.push(student)
    const comment1 = makeAnswerComment({
      answerId: new UniqueEntityId('answer-1'),
      authorId: student.id,
    })
    const comment2 = makeAnswerComment({
      answerId: new UniqueEntityId('answer-1'),
      authorId: student.id,
    })
    const comment3 = makeAnswerComment({
      answerId: new UniqueEntityId('answer-1'),
      authorId: student.id,
    })
    await answerCommentRepository.create(comment1)
    await answerCommentRepository.create(comment2)
    await answerCommentRepository.create(comment3)

    const result = await sut.execute({
      answerId: 'answer-1',
      page: 1,
    })

    expect(result.value?.comments).toHaveLength(3)
    expect(result.value?.comments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          author: 'John Doe',
          commentId: comment1.id,
        }),
        expect.objectContaining({
          author: 'John Doe',
          commentId: comment2.id,
        }),
        expect.objectContaining({
          author: 'John Doe',
          commentId: comment3.id,
        }),
      ]),
    )
  })

  it('should be able to fetch paginated recent answers', async () => {
    const { sut, answerCommentRepository, studentsRepository } = makeSut()
    const student = makeStudent({
      name: 'John Doe',
    })

    studentsRepository.items.push(student)
    for (let i = 1; i <= 22; i++) {
      await answerCommentRepository.create(
        makeAnswerComment({
          answerId: new UniqueEntityId('answer-1'),
          authorId: student.id,
        }),
      )
    }
    const result = await sut.execute({
      answerId: 'answer-1',
      page: 2,
    })
    expect(result.value?.comments).toHaveLength(2)
  })
})
