const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

// Configuración de la conexión a la base de datos
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "migu3l98",
    database: "PanaderiaLaDesesperanza"
});

// Conectar a la base de datos y manejar errores de conexión
con.connect((err) => {
    if (err) {
        console.error("Error al conectar a la base de datos:", err);
        process.exit(1); // Finaliza el proceso si hay error
    }
    console.log("Conexión exitosa a la base de datos");
});

// Configuración de middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Carpeta para archivos front-end (HTML, CSS, JS)

// Ruta para servir el index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Crear un nuevo producto
app.post("/agregarProducto", (req, res) => {
    const { nombre, tipo, precio, cantidad } = req.body;

    if (!nombre || !tipo || !precio || precio <= 0 || !cantidad || cantidad < 0) {
        return res.status(400).send("Datos de producto inválidos o incompletos.");
    }

    con.query(
        "INSERT INTO Productos (nombre, tipo, precio) VALUES (?, ?, ?)",
        [nombre, tipo, precio],
        (err, resultado) => {
            if (err) {
                console.error("Error al agregar producto:", err);
                return res.status(500).send("Error al agregar producto.");
            }

            con.query(
                "INSERT INTO Inventario (producto_id, cantidad) VALUES (?, ?)",
                [resultado.insertId, cantidad],
                (err) => {
                    if (err) {
                        console.error("Error al agregar inventario:", err);
                        return res.status(500).send("Error al agregar inventario.");
                    }
                    return res.send("Producto agregado correctamente");
                }
            );
        }
    );
});

// Obtener todos los productos
app.get("/productos", (req, res) => {
    const query = `
        SELECT Productos.producto_id, Productos.nombre, Productos.tipo, Productos.precio, Inventario.cantidad
        FROM Productos
        JOIN Inventario ON Productos.producto_id = Inventario.producto_id
    `;

    con.query(query, (err, productos) => {
        if (err) {
            console.error("Error al obtener productos:", err);
            return res.status(500).send("Error al obtener productos.");
        }
        res.json(productos);
    });
});

// Obtener un producto específico por su ID
app.get("/productos/:id", (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT Productos.producto_id, Productos.nombre, Productos.tipo, Productos.precio, Inventario.cantidad
        FROM Productos
        JOIN Inventario ON Productos.producto_id = Inventario.producto_id
        WHERE Productos.producto_id = ?
    `;

    con.query(query, [id], (err, producto) => {
        if (err) {
            console.error("Error al obtener el producto:", err);
            return res.status(500).send("Error al obtener el producto.");
        }

        if (producto.length === 0) {
            return res.status(404).send("Producto no encontrado.");
        }

        res.json(producto[0]);
    });
});

app.put("/editarProducto/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, tipo, precio, cantidad } = req.body;

    if (!nombre || !tipo || !precio || precio <= 0 || !cantidad || cantidad < 0) {
        return res.status(400).send("Datos de producto inválidos o incompletos.");
    }

    con.query(
        "UPDATE Productos SET nombre = ?, tipo = ?, precio = ? WHERE producto_id = ?",
        [nombre, tipo, precio, id],
        (err) => {
            if (err) {
                console.error("Error al editar producto:", err);
                return res.status(500).send("Error al editar producto.");
            }

            con.query(
                "UPDATE Inventario SET cantidad = ? WHERE producto_id = ?",
                [cantidad, id],
                (err) => {
                    if (err) {
                        console.error("Error al actualizar inventario:", err);
                        return res.status(500).send("Error al actualizar inventario.");
                    }
                    return res.send("Producto actualizado correctamente");
                }
            );
        }
    );
});


// Eliminar un producto por su ID
app.delete("/eliminarProducto/:id", (req, res) => {
    const { id } = req.params;

    con.query("DELETE FROM Inventario WHERE producto_id = ?", [id], (err) => {
        if (err) {
            console.error("Error al eliminar inventario:", err);
            return res.status(500).send("Error al eliminar inventario.");
        }

        con.query("DELETE FROM Productos WHERE producto_id = ?", [id], (err) => {
            if (err) {
                console.error("Error al eliminar producto:", err);
                return res.status(500).send("Error al eliminar producto.");
            }
            return res.send("Producto eliminado correctamente");
        });
    });
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log("Servidor ejecutándose en http://localhost:3000");
});
