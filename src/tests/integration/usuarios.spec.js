// tests/integration/usuarios.spec.js
const request = require('supertest')
const app = require('../../src/app') // exporta tu express app desde src/app.js
const { Usuario, sequelize } = require('../../src/models')
const JWTUtil = require('../../src/utils/jwt')

describe('Usuarios API - integración', () => {
  let user, token

  beforeAll(async () => {
    // opcional: usar DB de test separada (NODE_ENV=test)
    // Crear usuario de prueba
    user = await Usuario.create({
      nombre: 'Test User',
      username: `testuser_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password_hash: 'Password1234' // hook lo hashea
    })

    token = JWTUtil.generateToken({ id: user.id, username: user.username, rol: user.rol })
  })

  afterAll(async () => {
    // limpiar
    await Usuario.destroy({ where: { id: user.id }, force: true })
    await sequelize.close()
  })

  test('PUT /api/usuarios/:id actualiza perfil (200)', async () => {
    const res = await request(app)
      .put(`/api/usuarios/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'User Updated',
        email: `updated${Date.now()}@example.com`,
        telefono_e164: '+5355555555'
      })
      .expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.data.nombre).toBe('User Updated')
    // verificar DB
    const updated = await Usuario.findByPk(user.id)
    expect(updated.nombre).toBe('User Updated')
  })

  test('PUT /api/usuarios/:id no autorizado (403) cuando otro usuario intenta editar', async () => {
    // generar token de otro usuario
    const other = await Usuario.create({
      nombre: 'Other',
      username: `other_${Date.now()}`,
      email: `other${Date.now()}@example.com`,
      password_hash: 'Password1234'
    })
    const otherToken = JWTUtil.generateToken({ id: other.id, username: other.username, rol: other.rol })

    await request(app)
      .put(`/api/usuarios/${user.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ nombre: 'Hack' })
      .expect(403)

    // cleanup other
    await Usuario.destroy({ where: { id: other.id }, force: true })
  })
})
