import { test, expect } from 'vitest'
import Fastify from 'fastify'
import { AppError } from '../app.error'
import { errorHandler } from './error-handler.error'
import { ERROR_STATUS } from '../error.constant'

test('returns expected application errors', async () => {
  const app = Fastify()
  app.setErrorHandler(errorHandler)

  app.get('/test', async () => {
    throw new AppError(
      ERROR_STATUS.VALIDATION_ERROR.STATUS_CODE,
      ERROR_STATUS.VALIDATION_ERROR.CODE,
      ERROR_STATUS.VALIDATION_ERROR.MESSAGE
    )
  })

  try {
    const response = await app.inject({method: 'GET', url: '/test'})

    expect(response.statusCode).toBe(ERROR_STATUS.VALIDATION_ERROR.STATUS_CODE)
    expect(response.json()).toEqual({error: {
      code: ERROR_STATUS.VALIDATION_ERROR.CODE,
      message: ERROR_STATUS.VALIDATION_ERROR.MESSAGE
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

    expect(response.statusCode).toBe(ERROR_STATUS.INTERNAL_SERVER_ERROR.STATUS_CODE)
    expect(response.json().error.code).toBe(ERROR_STATUS.INTERNAL_SERVER_ERROR.CODE)
    expect(response.body).not.toContain('Sensitive internal details')
  } finally {
    await app.close()
  }
})