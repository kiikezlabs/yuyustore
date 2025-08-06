// Importa todas las funciones necesarias de Firebase en un solo lugar
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCVuW9lEwz5986S2Mzhbmh-LMiKeo5L1XU",
    authDomain: "store-45f74.firebaseapp.com",
    databaseURL: "https://store-45f74-default-rtdb.firebaseio.com",
    projectId: "store-45f74",
    storageBucket: "store-45f74.firebasestorage.app",
    messagingSenderId: "296996281651",
    appId: "1:296996281651:web:d64fa03b3223a2f62d3246",
    measurementId: "G-0L2Q0V17QL"
};

// Inicializa Firebase y obtén las referencias
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Referencias a los elementos del DOM
const form = document.getElementById('item-form');
const inventoryList = document.getElementById('inventory-list');
const prendasCol = collection(db, 'prendas'); // Usa la referencia 'db' directamente

// 1. Guardar una nueva prenda en Firebase (incluyendo la imagen)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = form['nombre'].value;
    const cantidad = form['cantidad'].value;
    const imagenFile = form['imagen'].files?.[0];

    try {
        let imageUrl = null;
        if (imagenFile) {
            const storageRef = ref(storage, `images/${Date.now()}_${imagenFile.name}`);
            const snapshot = await uploadBytes(storageRef, imagenFile);
            imageUrl = await getDownloadURL(snapshot.ref);
            console.log("Imagen subida con éxito:", imageUrl);
        }

        await addDoc(prendasCol, {
            nombre: nombre,
            cantidad: parseInt(cantidad),
            imagenUrl: imageUrl
        });

        form.reset();
        console.log("Prenda agregada con éxito a Firestore.");
    } catch (error) {
        console.error("Error al agregar la prenda o subir la imagen: ", error);
    }
});

// 2. Mostrar la lista de prendas en tiempo real (incluyendo la imagen)
onSnapshot(prendasCol, (snapshot) => {
    inventoryList.innerHTML = '';
    
    snapshot.docs.forEach(docPrenda => {
        const item = docPrenda.data();
        const li = document.createElement('li');

        let imageHtml = '';
        if (item.imagenUrl) {
            imageHtml = `<img src="${item.imagenUrl}" alt="${item.nombre}" style="max-width: 50px; max-height: 50px; margin-right: 10px; border-radius: 4px;">`;
        }

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.setAttribute('data-id', docPrenda.id);
        
        li.innerHTML = `
            <div>${imageHtml}<span>${item.nombre} - Cantidad: ${item.cantidad}</span></div>
        `;
        li.appendChild(deleteButton);
        inventoryList.appendChild(li);

        deleteButton.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            try {
                await deleteDoc(doc(db, "prendas", id));
                console.log("Prenda eliminada con éxito.");
            } catch (error) {
                console.error("Error al eliminar la prenda: ", error);
            }
        });
    });
});
