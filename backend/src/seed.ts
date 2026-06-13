import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
});

async function seed() {
  await ds.initialize();
  console.log('Conectado a Railway PostgreSQL');

  await ds.query(`
    INSERT INTO servicios (id, nombre, duracion_min, precio, activo)
    VALUES
      (gen_random_uuid(), 'Corte de cabello', 30, 8000, true),
      (gen_random_uuid(), 'Corte + barba', 45, 12000, true),
      (gen_random_uuid(), 'Barba completa', 30, 7000, true),
      (gen_random_uuid(), 'Corte niño', 20, 5000, true)
    ON CONFLICT DO NOTHING;
  `);
  console.log('✓ Servicios creados');

  await ds.query(`
    INSERT INTO barberos (id, nombre, telefono, activo)
    VALUES
      (gen_random_uuid(), 'Carlos Pérez', '+56912345678', true),
      (gen_random_uuid(), 'Diego Ramírez', '+56987654321', true),
      (gen_random_uuid(), 'Matías Torres', null, true)
    ON CONFLICT DO NOTHING;
  `);
  console.log('✓ Barberos creados');

  const hash = await bcrypt.hash('admin123', 10);
  await ds.query(`
    INSERT INTO usuarios (id, nombre, email, password, rol, activo)
    VALUES (gen_random_uuid(), 'Administrador', 'admin@clipbooking.cl', '${hash}', 'dueno', true)
    ON CONFLICT (email) DO NOTHING;
  `);
  console.log('✓ Usuario admin creado  →  admin@clipbooking.cl / admin123');

  await ds.destroy();
  console.log('\n✅ Seed completo. Abre http://localhost:3001');
}

seed().catch((e) => { console.error(e); process.exit(1); });
