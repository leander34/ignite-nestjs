/* eslint-disable @typescript-eslint/no-empty-function */
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { ReadNotificationUseCase } from './read-notification'
import { makeNotification } from 'test/factories/make-notification'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

const makeSut = () => {
  const notificationsRepository = new InMemoryNotificationsRepository()
  const sut = new ReadNotificationUseCase(notificationsRepository)
  return {
    sut,
    notificationsRepository,
  }
}
describe('Read Notification', () => {
  it('should be able to read a notification', async () => {
    const { sut, notificationsRepository } = makeSut()

    const notification = makeNotification()

    await notificationsRepository.create(notification)

    const result = await sut.execute({
      notificationId: notification.id.toString(),
      recipientId: notification.recipientId.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(notificationsRepository.items[0].readAt).toEqual(expect.any(Date))
  })

  it('should be able to read a notification from another user', async () => {
    const { sut, notificationsRepository } = makeSut()

    const notification = makeNotification({
      recipientId: new UniqueEntityId('recipient-01'),
    })

    await notificationsRepository.create(notification)

    const result = await sut.execute({
      notificationId: notification.id.toString(),
      recipientId: 'recipient-02',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
