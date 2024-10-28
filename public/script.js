function loadProducts() {
    fetch('http://localhost:3000/productos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener productos: ' + response.status);
            }
            return response.json();
        })
        .then(productos => {
            const tbody = document.getElementById('productTableBody');
            tbody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos productos

            // Agregar cada producto a la tabla
            productos.forEach(producto => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${producto.nombre}</td>
                    <td>${producto.tipo}</td>
                    <td>$${producto.precio}</td>
                    <td>${producto.cantidad}</td>
                    <td>
                        <button class="btn btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#viewModal" onclick="viewProduct(${producto.producto_id})">Ver</button>
                        <button class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#editModal" onclick="editProduct(${producto.producto_id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${producto.producto_id})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

// Llamar a loadProducts cuando se carga la página
document.addEventListener('DOMContentLoaded', loadProducts);

const tbody = document.getElementById('productTableBody');


// Modificar validateForm para cargar productos después de agregar uno
function validateForm() {
    const productName = document.getElementById("productName").value.trim();
    const productType = document.getElementById("productType").value;
    const productPrice = document.getElementById("productPrice").value.trim();
    const productQuantity = document.getElementById("productQuantity").value.trim();

    let valid = true;
    let errorMessage = "";

    if (!productName) {
        errorMessage += "El nombre del producto es obligatorio.\n";
        valid = false;
    }
    if (productType === "") {
        errorMessage += "Seleccione un tipo de producto.\n";
        valid = false;
    }
    if (!productPrice || productPrice <= 0) {
        errorMessage += "El precio debe ser mayor a 0.\n";
        valid = false;
    }
    if (!productQuantity || productQuantity <= 0) {
        errorMessage += "La cantidad debe ser mayor a 0.\n";
        valid = false;
    }

    if (valid) {
        const productData = {
            nombre: productName,
            tipo: productType,
            precio: parseFloat(productPrice),
            cantidad: parseInt(productQuantity, 10)
        };

        fetch('/agregarProducto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.status);
            }
            return response.text();
        })
        .then(data => {
            alert(data); // Muestra la respuesta del servidor
            document.getElementById("productForm").reset(); // Limpiar formulario
            loadProducts(); // Recargar la lista de productos
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    } else {
        alert(errorMessage);
    }
}

let productToDeleteId;

function openDeleteModal(id) {
    productToDeleteId = id;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

function deleteProduct() {
    if (!productToDeleteId) return;

    fetch(`/eliminarProducto/${productToDeleteId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al eliminar el producto: ' + response.status);
        }
        return response.text();
    })
    .then(data => {
        alert(data);
        loadProducts();
    })
    .catch(error => {
        alert('Error: ' + error.message);
    });
}

// Función para ver los detalles de un producto
function viewProduct(id) {
    fetch(`/productos/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el producto: ' + response.status);
            }
            return response.json();
        })
        .then(producto => {
            // Colocar los datos del producto en el modal
            document.getElementById('viewProductName').textContent = producto.nombre;
            document.getElementById('viewProductType').textContent = producto.tipo;
            document.getElementById('viewProductPrice').textContent = producto.precio;
            document.getElementById('viewProductQuantity').textContent = producto.cantidad;

            // Mostrar el modal de ver producto
            const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
            viewModal.show();
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

let currentProductId;

function editProduct(id) {
    currentProductId = id;

    fetch(`/productos/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el producto: ' + response.status);
            }
            return response.json();
        })
        .then(producto => {
            document.getElementById('editProductName').value = producto.nombre;
            document.getElementById('editProductType').value = producto.tipo;
            document.getElementById('editProductPrice').value = producto.precio;
            document.getElementById('editProductQuantity').value = producto.cantidad;
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

function updateProduct() {
    const productData = {
        nombre: document.getElementById("editProductName").value.trim(),
        tipo: document.getElementById("editProductType").value,
        precio: parseFloat(document.getElementById("editProductPrice").value.trim()),
        cantidad: parseInt(document.getElementById("editProductQuantity").value.trim(), 10)
    };

    fetch(`/editarProducto/${currentProductId}`, { // Cambiar aquí la URL
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al actualizar el producto: ' + response.status);
        }
        return response.text();
    })
    .then(data => {
        alert(data);
        loadProducts();
        document.getElementById("editProductForm").reset();
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        editModal.hide();
    })
    .catch(error => {
        alert('Error: ' + error.message);
    });
}

