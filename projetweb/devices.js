async function fetchDevices() {
    try {
        // Récupérer les données des appareils depuis l'API
        const response = await fetch('http://localhost:5000/api/devices');
        const devices = await response.json();

        // Assurez-vous que des données sont disponibles
        if (devices.length === 0) {
            console.error('Aucun appareil trouvé dans la base de données.');
            return;
        }

        // Sélectionner le tableau pour Router 1
        const router1TableBody = document.querySelector('#router-1 tbody');
        router1TableBody.innerHTML = ''; // Effacer les données précédentes

        // Récupérer le premier routeur
        const router1 = devices[0]; // Supposons que le premier appareil est Router 1

        // Vérifiez que le routeur a des interfaces
        if (router1 && router1.Interfaces) {
            router1.Interfaces.forEach((iface, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${iface.Status === '1' ? 'Up' : 'Down'}</td>
                    <td>${iface.IP || 'N/A'}</td>
                    <td>${iface.Inbound_Traffic || '0'} / ${iface.Outbound_Traffic || '0'} bytes</td>
                    <td class="primary">Details</td>
                `;
                router1TableBody.appendChild(row);
            });
        } else {
            router1TableBody.innerHTML = '<tr><td colspan="5">No data available</td></tr>';
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
    }
}

// Appeler la fonction fetchDevices lorsque la page est chargée
window.onload = fetchDevices;
function showMoreInfo(device) {
    const infoDiv = document.getElementById(`${device}-info`);
    const isVisible = infoDiv.style.display === 'block';
    
   
    if (isVisible) {
        infoDiv.style.display = 'none';
    } else {
        infoDiv.style.display = 'block';
    }
}

function goBack() {
    if (window.history.length > 1) {
        window.history.back(); // Revenir à la page précédente
    } else {
        console.log("Pas d'historique pour revenir en arrière.");
    }
}

