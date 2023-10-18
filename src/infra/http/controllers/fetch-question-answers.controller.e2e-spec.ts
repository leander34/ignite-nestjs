import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AnswerFactory } from 'test/factories/make-answer'
import { QuestionFactory } from 'test/factories/make-question'
import { StudentFactory } from 'test/factories/make-student'
describe('Fetch recent questions (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let answerFactory: AnswerFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AnswerFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })
  test('[GET] /questions/:questionId/answers', async () => {
    const user = await studentFactory.makePrismaStudent()
    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
      title: 'Question 01',
    })

    const questionId = question.id.toString()

    await Promise.all([
      answerFactory.makePrismaAnswer({
        questionId: question.id,
        authorId: user.id,
        content: 'Answer 01',
      }),
      answerFactory.makePrismaAnswer({
        questionId: question.id,
        authorId: user.id,
        content: 'Answer 02',
      }),
      answerFactory.makePrismaAnswer({
        questionId: question.id,
        authorId: user.id,
        content: 'Answer 03',
      }),
    ])

    const response = await request(app.getHttpServer())
      .get(`/questions/${questionId}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)

    expect(response.body).toEqual({
      answers: expect.arrayContaining([
        expect.objectContaining({
          content: 'Answer 01',
        }),
        expect.objectContaining({
          content: 'Answer 02',
        }),
        expect.objectContaining({
          content: 'Answer 03',
        }),
      ]),
    })
  })

  test('[GET] /questions (paginated)', async () => {
    await prisma.answer.deleteMany({})
    await prisma.question.deleteMany({})
    await prisma.user.deleteMany({})
    const user = await studentFactory.makePrismaStudent()
    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
      title: 'Question 01',
    })

    const questionId = question.id.toString()

    for (let i = 1; i <= 22; i++) {
      await answerFactory.makePrismaAnswer({
        questionId: question.id,
        authorId: user.id,
        content: `Answer ${i}`,
      })
    }

    const response = await request(app.getHttpServer())
      .get(`/questions/${questionId}/answers?page=2`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.answers).toHaveLength(2)

    expect(response.body).toEqual({
      answers: expect.arrayContaining([
        expect.objectContaining({
          content: 'Answer 1',
        }),
        expect.objectContaining({
          content: 'Answer 2',
        }),
      ]),
    })
  })
})
