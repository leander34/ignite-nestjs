import { expect, it } from 'vitest'
import { Slug } from './slug'

it('should be able to create a new slug from text', () => {
  const slug = Slug.createFromText('Exemple question title')
  expect(slug.value).toEqual('exemple-question-title')
})
