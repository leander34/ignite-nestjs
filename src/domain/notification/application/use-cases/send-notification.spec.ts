/* eslint-disable @typescript-eslint/no-empty-function */

import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { SendNotificationUseCase } from './send-notification'

const makeSut = () => {
  const notificationsRepository = new InMemoryNotificationsRepository()
  const sut = new SendNotificationUseCase(notificationsRepository)
  return {
    sut,
    notificationsRepository,
  }
}
describe('Send Notification', () => {
  it('should be able to send a notification', async () => {
    const { sut, notificationsRepository } = makeSut()

    const result = await sut.execute({
      recipientId: 'recipient-01',
      title: 'Nova notificação',
      content: 'Conteúdo da notificação',
    })

    expect(result.isRight()).toBeTruthy()
    expect(notificationsRepository.items[0]).toEqual(result.value?.notification)
  })
})
