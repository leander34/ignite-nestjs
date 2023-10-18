/* eslint-disable @typescript-eslint/no-empty-function */
import { FetchQuestionCommentsUseCase } from './fetch-question-comments'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository'
import { makeQuestionComment } from 'test/factories/make-question-comment'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'
import { makeStudent } from 'test/factories/make-student'

const makeSut = () => {
  const studentsRepository = new InMemoryStudentsRepository()
  const questionCommentRepository = new InMemoryQuestionCommentsRepository(
    studentsRepository,
  )
  const sut = new FetchQuestionCommentsUseCase(questionCommentRepository)
  return {
    sut,
    questionCommentRepository,
    studentsRepository,
  }
}
describe('Fetch Question Comments', () => {
  it('should be able to fetch question comments', async () => {
    const { sut, questionCommentRepository, studentsRepository } = makeSut()
    const student = makeStudent({ name: 'John Doe' })

    studentsRepository.items.push(student)
    const comment1 = makeQuestionComment({
      questionId: new UniqueEntityId('question-1'),
      authorId: student.id,
    })
    const comment2 = makeQuestionComment({
      questionId: new UniqueEntityId('question-1'),
      authorId: student.id,
    })
    const comment3 = makeQuestionComment({
      questionId: new UniqueEntityId('question-1'),
      authorId: student.id,
    })

    await questionCommentRepository.create(comment1)
    await questionCommentRepository.create(comment2)
    await questionCommentRepository.create(comment3)

    const result = await sut.execute({
      questionId: 'question-1',
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

  it('should be able to fetch paginated recent questions', async () => {
    const { sut, questionCommentRepository, studentsRepository } = makeSut()
    const student = makeStudent()

    studentsRepository.items.push(student)
    for (let i = 1; i <= 22; i++) {
      await questionCommentRepository.create(
        makeQuestionComment({
          questionId: new UniqueEntityId('question-1'),
          authorId: student.id,
        }),
      )
    }
    const result = await sut.execute({
      questionId: 'question-1',
      page: 2,
    })
    expect(result.value?.comments).toHaveLength(2)
  })
})
