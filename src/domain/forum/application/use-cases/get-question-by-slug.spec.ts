/* eslint-disable @typescript-eslint/no-empty-function */
import { makeQuestion } from 'test/factories/make-question'
import { GetQuestionBySlugUseCase } from './get-question-by-slug'
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { Slug } from '../../enterprise/entities/value-objects/slug'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachment-repository'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { makeStudent } from 'test/factories/make-student'
import { makeAttachment } from 'test/factories/make-attachment'
import { makeQuestionAttachment } from 'test/factories/make-question-attachment'

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
  const sut = new GetQuestionBySlugUseCase(questionsRepository)
  return {
    sut,
    questionsRepository,
    studentsRepository,
    attachmentsRepository,
    questionAttachmentsRepository,
  }
}
describe('Get Question By Slug', () => {
  it('should be able to get a question by slug', async () => {
    const {
      sut,
      questionsRepository,
      studentsRepository,
      attachmentsRepository,
      questionAttachmentsRepository,
    } = makeSut()
    const student = makeStudent({
      name: 'John Doe',
    })

    studentsRepository.items.push(student)
    const newQuestion = makeQuestion({
      slug: Slug.create('example-question'),
      authorId: student.id,
    })
    await questionsRepository.create(newQuestion)

    const attachment = makeAttachment({
      title: 'Some attachment',
    })

    attachmentsRepository.items.push(attachment)

    questionAttachmentsRepository.items.push(
      makeQuestionAttachment({
        questionId: newQuestion.id,
        attachmentId: attachment.id,
      }),
    )

    const result = await sut.execute({
      slug: 'example-question',
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value).toMatchObject({
        question: expect.objectContaining({
          title: newQuestion.title,
          author: 'John Doe',
          attachments: [
            expect.objectContaining({
              title: 'Some attachment',
            }),
          ],
        }),
      })
    }
  })
})
