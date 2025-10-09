export type PictureSource = 'cats' | 'dogs'

export const API = {
  cats: 'https://cataas.com/cat',                  // 1 котик на запрос
  dogs: 'https://dog.ceo/api/breeds/image/random/',// +count в конце
} as const
