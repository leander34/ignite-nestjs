/* eslint-disable @typescript-eslint/no-empty-function */
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { makeQuestion } from 'test/factories/make-question'
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository'
import { CommentOnQuestionUseCase } from './comment-on-question'
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

  const questionCommentRepository = new InMemoryQuestionCommentsRepository(
    studentsRepository,
  )
  const sut = new CommentOnQuestionUseCase(
    questionsRepository,
    questionCommentRepository,
  )
  return {
    sut,
    questionsRepository,
    questionCommentRepository,
  }
}
describe('Comment on Question', () => {
  it('should be able to comment on question', async () => {
    const { sut, questionsRepository, questionCommentRepository } = makeSut()
    const question = makeQuestion()

    await questionsRepository.create(question)

    await sut.execute({
      questionId: question.id.toString(),
      authorId: question.authorId.toString(),
      content: 'Comentário qualquer',
    })

    expect(questionCommentRepository.items[0].content).toEqual(
      'Comentário qualquer',
    )
  })
})
