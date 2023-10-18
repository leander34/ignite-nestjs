import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { UploadAndCreateAttachmentUseCase } from './upload-and-create-attachment'
import { FakeUploader } from 'test/store/fake-uploader'
import { InvalidAttachmentType } from './errors/invalid-attachment-type'

const makeSut = () => {
  const attachmentsRepository = new InMemoryAttachmentsRepository()
  const fakeUploader = new FakeUploader()
  const sut = new UploadAndCreateAttachmentUseCase(
    attachmentsRepository,
    fakeUploader,
  )
  return {
    sut,
    attachmentsRepository,
    fakeUploader,
  }
}
describe('Upload and create attachment', () => {
  it('should be able to upload and create an attachment', async () => {
    const { sut, attachmentsRepository, fakeUploader } = makeSut()

    const result = await sut.execute({
      fileName: 'profile.png',
      fileType: 'image/png',
      body: Buffer.from(''),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      attachment: attachmentsRepository.items[0],
    })
    expect(attachmentsRepository.items.length).toEqual(1)
    expect(fakeUploader.uploads.length).toEqual(1)

    expect(fakeUploader.uploads[0]).toEqual(
      expect.objectContaining({
        fileName: 'profile.png',
        url: expect.any(String),
      }),
    )
    if (result.isRight()) {
      expect(result.value.attachment.url).toEqual(fakeUploader.uploads[0].url)
    }
    expect(attachmentsRepository.items).toEqual([
      expect.objectContaining({
        title: 'profile.png',
        url: fakeUploader.uploads[0].url,
      }),
    ])
  })

  it('should not be able to upload and create an attachment with an invalid file type', async () => {
    const { sut } = makeSut()

    const result = await sut.execute({
      fileName: 'profile.mp3',
      fileType: 'audio/mpeg',
      body: Buffer.from(''),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidAttachmentType)
  })
})
