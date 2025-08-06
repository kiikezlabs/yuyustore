// Referencias a los elementos del DOM
const form = document.getElementById('item-form');
const inventoryList = document.getElementById('inventory-list');

// Referencia a la colección 'prendas' en Firestore
const prendasCol = collection(window.db, 'prendas');

// 1. Guardar una nueva prenda en Firebase
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = form['nombre'].value;
    const cantidad = form['cantidad'].value;

    try {
        await addDoc(prendasCol, {
            nombre: nombre,
            cantidad: parseInt(cantidad)
        });
        form.reset(); // Limpia el formulario
        console.log("Prenda agregada con éxito.");
    } catch (error) {
        console.error("Error al agregar la prenda: ", error);
    }
});

// 2. Mostrar la lista de prendas en tiempo real y añadir la función de eliminar
onSnapshot(prendasCol, (snapshot) => {
    // Limpia la lista antes de volver a renderizar
    inventoryList.innerHTML = '';
    
    snapshot.docs.forEach(docPrenda => {
        const item = docPrenda.data();
        const li = document.createElement('li');
        
        // Añade el botón de eliminar
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        
        // Asigna el ID del documento al botón para saber qué eliminar
        deleteButton.setAttribute('data-id', docPrenda.id);
        
        li.innerHTML = `
            ${item.nombre} - Cantidad: ${item.cantidad}
        `;
        li.appendChild(deleteButton);
        inventoryList.appendChild(li);

        // Agrega un escuchador de eventos para el botón
        deleteButton.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            try {
                // Usa la función 'deleteDoc' para eliminar la prenda
                await deleteDoc(doc(window.db, "prendas", id));
                console.log("Prenda eliminada con éxito.");
            } catch (error) {
                console.error("Error al eliminar la prenda: ", error);
            }
        });
    });
});
