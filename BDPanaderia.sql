-- Creación de la base de datos
CREATE DATABASE PanaderiaLaDesesperanza;
USE PanaderiaLaDesesperanza;

-- Tabla Productos
CREATE TABLE Productos (
    producto_id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('Día de Muertos', 'Halloween') NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imagen_url VARCHAR(255)
);

select * from Productos;

-- Tabla Inventario
CREATE TABLE Inventario (
    inventario_id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad >= 0),
    FOREIGN KEY (producto_id) REFERENCES Productos(producto_id) ON DELETE CASCADE
);

select * from Inventario;

USE PanaderiaLaDesesperanza;
ALTER TABLE Productos
ADD COLUMN imagen_url VARCHAR(300);
select * from Productos;
ALTER TABLE Productos ADD UNIQUE(nombre);