import { test, expect } from 'vitest'
import Fastify from 'fastify'
import { AppError } from '../app.error'
import { errorHandler } from './error-handler.error'
import { HTTP_ERRORS } from '../error.constant'

test('returns expected application errors', async () => {
  const app = Fastify()
  app.setErrorHandler(errorHandler)

  app.get('/test', async () => {
    throw new AppError(
      HTTP_ERRORS.VALIDATION_ERROR.statusCode,
      HTTP_ERRORS.VALIDATION_ERROR.code,
      HTTP_ERRORS.VALIDATION_ERROR.message
    )
  })

  try {
    const response = await app.inject({method: 'GET', url: '/test'})

    expect(response.statusCode).toBe(HTTP_ERRORS.VALIDATION_ERROR.statusCode)
    expect(response.json()).toEqual({error: {
      code: HTTP_ERRORS.VALIDATION_ERROR.code,
      message: HTTP_ERRORS.VALIDATION_ERROR.message
    }})
  } finally {
    await app.close()
  }
})

test('hides unexpected error details', async () => {
  const app = Fastify()
  app.setErrorHandler(errorHandler)

  app.get('/test', async () => {
    throw new Error('Sensitive internal details')
  })

  try {
    const response = await app.inject({method: 'GET', url: '/test'})

    expect(response.statusCode).toBe(HTTP_ERRORS.INTERNAL_SERVER_ERROR.statusCode)
    expect(response.json().error.code).toBe(HTTP_ERRORS.INTERNAL_SERVER_ERROR.code)
    expect(response.body).not.toContain('Sensitive internal details')
  } finally {
    await app.close()
  }
})