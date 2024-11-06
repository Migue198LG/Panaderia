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
        process.exit(1);
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

// Crear un nuevo producto con verificación de duplicados
app.post("/agregarProducto", (req, res) => {
    const { nombre, tipo, precio, cantidad, imagen_url } = req.body;

    if (!nombre || !tipo || !precio || precio <= 0 || !cantidad || cantidad < 0) {
        return res.status(400).send("Datos de producto inválidos o incompletos.");
    }

    // Verificar si ya existe un producto con el mismo nombre
    con.query("SELECT * FROM Productos WHERE nombre = ?", [nombre], (err, resultados) => {
        if (err) {
            console.error("Error al verificar producto existente:", err);
            return res.status(500).send("Error al verificar producto.");
        }

        if (resultados.length > 0) {
            // Si ya existe un producto con el mismo nombre, retornar un mensaje de error
            return res.status(400).send("Ya existe un producto con este nombre.");
        }

        // Insertar producto si no existe duplicado
        con.query(
            "INSERT INTO Productos (nombre, tipo, precio, imagen_url) VALUES (?, ?, ?, ?)",
            [nombre, tipo, precio, imagen_url],
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
});




// Obtener todos los productos
app.get("/productos", (req, res) => {
    const query = `
    SELECT Productos.producto_id, Productos.nombre, Productos.tipo, Productos.precio, Productos.imagen_url, Inventario.cantidad
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

app.listen(3000, () => {
    console.log("Servidor ejecutándose en http://localhost:3000");
});
