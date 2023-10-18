/* eslint-disable @typescript-eslint/no-empty-function */
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { makeAnswer } from 'test/factories/make-answer'
import { InMemoryAnswerCommentRepository } from 'test/repositories/in-memory-answer-comment-repository'
import { CommentOnAnswerUseCase } from './comment-on-answer'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachment-repository'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'

const makeSut = () => {
  const answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository()
  const answerRepository = new InMemoryAnswersRepository(
    answerAttachmentsRepository,
  )
  const studentsRepository = new InMemoryStudentsRepository()
  const answerCommentRepository = new InMemoryAnswerCommentRepository(
    studentsRepository,
  )
  const sut = new CommentOnAnswerUseCase(
    answerRepository,
    answerCommentRepository,
  )
  return {
    sut,
    answerRepository,
    answerCommentRepository,
  }
}
describe('Comment on Answer', () => {
  it('should be able to comment on answer', async () => {
    const { sut, answerRepository, answerCommentRepository } = makeSut()
    const answer = makeAnswer()

    await answerRepository.create(answer)

    await sut.execute({
      answerId: answer.id.toString(),
      authorId: answer.authorId.toString(),
      content: 'Comentário qualquer',
    })

    expect(answerCommentRepository.items[0].content).toEqual(
      'Comentário qualquer',
    )
  })
})
