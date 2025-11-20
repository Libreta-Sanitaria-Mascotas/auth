
## 🧩 Microservicio

### 🔐 `auth`
- Registro y login de usuarios
- Generación de access y refresh tokens (JWT)
- Almacenamiento de refresh tokens en Redis
- Logout y renovación de sesión (refresh)

#### Arranque rápido
```bash
npm install
npm run start:dev
```

Env esperadas en stack docker:
- Postgres: `auth_db`
- Redis: `redis_service`
- RabbitMQ URL (si se usa mensajería): `amqp://admin:admin123@rabbitmq:5672`

#### CI sugerido
- `npm ci`
- `npm test`
