CREATE DATABASE IF NOT EXISTS tripsplit CHARACTER SET utf8mb4;
USE tripsplit;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE viajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    destino VARCHAR(120) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    presupuesto_total DECIMAL(10,2) NOT NULL CHECK (presupuesto_total >= 0),
    CHECK (fecha_fin >= fecha_inicio),
    organizador_id INT NOT NULL,
    codigo_invitacion CHAR(8) UNIQUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizador_id) REFERENCES usuarios (id)
);

CREATE TABLE gastos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    viaje_id INT NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    categoria ENUM('hospedaje', 'transporte', 'comida', 'otros') NOT NULL,
    fecha DATE NOT NULL,
    pagado_por INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (viaje_id) REFERENCES viajes (id) ON DELETE CASCADE,
    FOREIGN KEY (pagado_por) REFERENCES usuarios (id)
);

CREATE TABLE participantes_viaje (
    id INT AUTO_INCREMENT PRIMARY KEY,
    viaje_id INT NOT NULL,
    usuario_id INT NOT NULL,
    rol ENUM('organizador', 'participante') NOT NULL DEFAULT 'participante',
    unido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (viaje_id, usuario_id),
    FOREIGN KEY (viaje_id) REFERENCES viajes (id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE TRIGGER registrar_organizador_como_participante
AFTER INSERT ON viajes
FOR EACH ROW
INSERT INTO participantes_viaje (viaje_id, usuario_id, rol)
VALUES (NEW.id, NEW.organizador_id, 'organizador');

CREATE TABLE actividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    viaje_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(300),
    lugar VARCHAR(150),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    creado_por INT NOT NULL,
    FOREIGN KEY (viaje_id) REFERENCES viajes (id) ON DELETE CASCADE,
    FOREIGN KEY (creado_por) REFERENCES usuarios (id)
);

CREATE TABLE gasto_participantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gasto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    monto_asignado DECIMAL(10,2) NOT NULL CHECK (monto_asignado >= 0),
    UNIQUE (gasto_id, usuario_id),
    FOREIGN KEY (gasto_id) REFERENCES gastos (id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    viaje_id INT NOT NULL,
    de_usuario_id INT NOT NULL,
    a_usuario_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    fecha DATE NOT NULL,
    CHECK (de_usuario_id <> a_usuario_id),
    FOREIGN KEY (viaje_id) REFERENCES viajes (id) ON DELETE CASCADE,
    FOREIGN KEY (de_usuario_id) REFERENCES usuarios (id),
    FOREIGN KEY (a_usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE items_equipaje (
    id INT AUTO_INCREMENT PRIMARY KEY,
    viaje_id INT NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    listo BOOLEAN NOT NULL DEFAULT FALSE,
    asignado_a INT NULL,
    creado_por INT NOT NULL,
    FOREIGN KEY (viaje_id) REFERENCES viajes (id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_a) REFERENCES usuarios (id),
    FOREIGN KEY (creado_por) REFERENCES usuarios (id)
);