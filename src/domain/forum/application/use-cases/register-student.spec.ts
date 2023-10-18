import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'
import { RegisterStudentUseCase } from './register-student'
import { FakerHasher } from 'test/cryptography/fake-hasher'

const makeSut = () => {
  const studentsRepository = new InMemoryStudentsRepository()
  const fakeHasher = new FakerHasher()
  const sut = new RegisterStudentUseCase(studentsRepository, fakeHasher)
  return {
    sut,
    studentsRepository,
    fakeHasher,
  }
}
describe('Register Student', () => {
  it('should be able to register a student', async () => {
    const { sut, studentsRepository } = makeSut()

    const result = await sut.execute({
      email: 'johndoe@example.com',
      name: 'John Doe',
      password: '123456',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      student: studentsRepository.items[0],
    })
    expect(studentsRepository.items.length).toEqual(1)
    expect(studentsRepository.items).toEqual([
      expect.objectContaining({
        email: 'johndoe@example.com',
        name: 'John Doe',
      }),
    ])
  })

  it('should hash student password upon registration', async () => {
    const { sut, studentsRepository, fakeHasher } = makeSut()

    const result = await sut.execute({
      email: 'johndoe@example.com',
      name: 'John Doe',
      password: '123456',
    })

    const hashedPassword = await fakeHasher.hash('123456')

    expect(result.isRight()).toBeTruthy()
    expect(studentsRepository.items[0].password).toEqual(hashedPassword)
  })
})
