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
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from Productos;

-- Tabla Inventario
CREATE TABLE Inventario (
    inventario_id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad >= 0),
    FOREIGN KEY (producto_id) REFERENCES Productos(producto_id) ON DELETE CASCADE
);
SELECT * FROM Productos WHERE producto_id = 3; -- Cambia 3 por el ID que quieras verificar


select * from Inventario;

-- Tabla Clientes (para futura expansión)
CREATE TABLE Clientes (
    cliente_id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(15),
    email VARCHAR(100),
    direccion VARCHAR(200)
);

-- Tabla Pedidos (para futura expansión)
CREATE TABLE Pedidos (
    pedido_id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('Pendiente', 'Enviado', 'Completado', 'Cancelado') NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES Clientes(cliente_id) ON DELETE SET NULL
);

-- Tabla Pedido_Productos (relación muchos a muchos entre Pedidos y Productos)
CREATE TABLE Pedido_Productos (
    pedido_id INT,
    producto_id INT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    PRIMARY KEY (pedido_id, producto_id),
    FOREIGN KEY (pedido_id) REFERENCES Pedidos(pedido_id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES Productos(producto_id) ON DELETE CASCADE
);

-- Tabla Facturas (para futura expansión)
CREATE TABLE Facturas (
    factura_id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NULL,
    fecha_factura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES Pedidos(pedido_id) ON DELETE SET NULL
);
