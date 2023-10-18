/* eslint-disable @typescript-eslint/no-empty-function */

import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'
import { FakerHasher } from 'test/cryptography/fake-hasher'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { AuthenticateStudentUseCase } from './authenticate-student'
import { makeStudent } from 'test/factories/make-student'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

const makeSut = () => {
  const studentsRepository = new InMemoryStudentsRepository()
  const fakeHasher = new FakerHasher()
  const fakeEncrypter = new FakeEncrypter()
  const sut = new AuthenticateStudentUseCase(
    studentsRepository,
    fakeHasher,
    fakeEncrypter,
  )
  return {
    sut,
    studentsRepository,
    fakeHasher,
    fakeEncrypter,
  }
}
describe('Authenticate Student', () => {
  it('should be able to autheticate a student', async () => {
    const { sut, studentsRepository, fakeHasher } = makeSut()

    const student = makeStudent({
      email: 'johndoe@example.com',
      password: await fakeHasher.hash('123456'),
    })

    await studentsRepository.create(student)
    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    })
  })

  it('should not be able to authenticate a student with a wrong email', async () => {
    const { sut, studentsRepository, fakeHasher } = makeSut()

    const student = makeStudent({
      email: 'johndoe@example.com',
      password: await fakeHasher.hash('123456'),
    })

    await studentsRepository.create(student)

    const result = await sut.execute({
      email: 'johndoeother@example.com',
      password: '123456',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('should not be able to authenticate a student with a wrong password', async () => {
    const { sut, studentsRepository, fakeHasher } = makeSut()

    const student = makeStudent({
      email: 'johndoe@example.com',
      password: await fakeHasher.hash('123456'),
    })

    await studentsRepository.create(student)

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '1234567',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })
})
