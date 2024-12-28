const themeToggler = document.querySelector(".theme-toggler");
 //mode sombre

 themeToggler.addEventListener('click', ( ) => {
    document.body.classList.toggle('dark-theme-variables');
    
    themeToggler.querySelector('span:nth-child(1)').classList.toggle('active');
    themeToggler.querySelector('span:nth-child(2)').classList.toggle('active');

 })
 
 
 
 
 // Fonction pour remplir le tableau du Router 1
async function fetchRouter1() {
    try {
        const response = await fetch('http://localhost:5000/api/devices');
        const devices = await response.json();

        const router1TableBody = document.querySelector('#router-1 tbody');
        router1TableBody.innerHTML = ''; // Effacer les données existantes

        if (devices && devices[0] && devices[0].Interfaces) {
            devices[0].Interfaces.forEach((iface, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${iface.Status === 'Up' || iface.Status === '1' ? 'Up' : 'Down'}</td>
                    <td>${iface.IP_Address || 'N/A'}</td>
                    <td>${iface.Inbound_Traffic || '0'} / ${iface.Outbound_Traffic || '0'} bytes</td>
                    <td class="primary">Details</td>
                `;
                router1TableBody.appendChild(row);
            });
        } else {
            router1TableBody.innerHTML = '<tr><td colspan="5">No data available</td></tr>';
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données du Router 1 :', error);
    }
}

// Fonction pour remplir le tableau du Router 2
async function fetchRouter2() {
    try {
        const response = await fetch('http://localhost:5000/api/devices');
        const devices = await response.json();

        const router2TableBody = document.querySelector('#router-2 tbody');
        router2TableBody.innerHTML = ''; // Effacer les données existantes

        if (devices && devices[1] && devices[1].Interfaces) {
            devices[1].Interfaces.forEach((iface, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${iface.Status === 'Up' || iface.Status === '1' ? 'Up' : 'Down'}</td>
                    <td>${iface.IP_Address || 'N/A'}</td>
                    <td>${iface.Inbound_Traffic || '0'} / ${iface.Outbound_Traffic || '0'} bytes</td>
                    <td class="primary">Details</td>
                `;
                router2TableBody.appendChild(row);
            });
        } else {
            router2TableBody.innerHTML = '<tr><td colspan="5">No data available</td></tr>';
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données du Router 2 :', error);
    }
}




async function fetchPCInfo() {
    try {
        const response = await fetch('http://localhost:5000/api/devices'); // Endpoint pour récupérer les données
        const devices = await response.json();

        const pcTableBody = document.querySelector('#pc-info tbody');
        pcTableBody.innerHTML = ''; // Effacer les anciennes données

        // Vérifier et afficher les données pour PC1 (devices[2])
        if (devices && devices[2]) {
            const pc1 = devices[2];
            const row1 = document.createElement('tr');
            row1.innerHTML = `
                <td>PC1</td>
                <td>${pc1["IP"] || 'N/A'}</td>
                <td>${pc1["CPU-Usage"] || 'N/A'}%</td>
                <td>${pc1["RAM-Usage"] || 'N/A'}%</td>
                <td class="primary">Details</td>
            `;
            pcTableBody.appendChild(row1);
        } else {
            console.warn("PC1 data is missing");
        }

        // Vérifier et afficher les données pour PC2 (devices[3])
        if (devices && devices[3]) {
            const pc2 = devices[3];
            const row2 = document.createElement('tr');
            row2.innerHTML = `
                <td>PC2</td>
                <td>${pc2["IP"] || 'N/A'}</td>
                <td>${pc2["CPU-Usage"] || 'N/A'}%</td>
                <td>${pc2["RAM-Usage"] || 'N/A'}%</td>
                <td class="primary">Details</td>
            `;
            pcTableBody.appendChild(row2);
        } else {
            console.warn("PC2 data is missing");
        }

    } catch (error) {
        console.error("Erreur lors de la récupération des données des PCs :", error);
    }
}


async function fetchUsername() {
  try {
    const token = localStorage.getItem('token'); // Récupérer le token depuis le localStorage

    if (!token) {
      console.warn('No token found');
      document.getElementById('username').textContent = "Guest";
      return;
    }

    const response = await fetch('/api/user', {
      headers: {
        Authorization: `Bearer ${token}`, // Inclure le jeton JWT
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch username');
    }

    const data = await response.json();
    document.getElementById('username').textContent = data.username || "Guest";
  } catch (error) {
    console.error('Error fetching username:', error);
    document.getElementById('username').textContent = "Guest"; // Valeur par défaut
  }
}


document.addEventListener("DOMContentLoaded", fetchUsername);

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Sélectionner l'élément où afficher les vues quotidiennes
        const dailyViewsElement = document.querySelector('.Daily .number p');

        // Appeler l'API pour obtenir les vues quotidiennes
        const response = await fetch('/api/daily-views');
        if (!response.ok) {
            throw new Error('Failed to fetch daily views');
        }

        const data = await response.json();

        // Mettre à jour le nombre de vues dans l'interface
        dailyViewsElement.textContent = data.views || 0;
    } catch (error) {
        console.error('Error fetching daily views:', error);
    }
});


async function fetchStats() {
    try {
        // Appel API pour récupérer les données des appareils
        const response = await fetch('http://localhost:5000/api/devices');
        const devices = await response.json();

        // Vérifier et insérer les données pour le Router 1
        if (devices && devices[0]) {
            document.getElementById('router1-cpu').textContent = `${devices[0]["CPU-Usage"] || 'N/A'}%`;
            document.getElementById('router1-ram').textContent = `${devices[0]["RAM-Usage"] || 'N/A'}%`;
            document.getElementById('router1-uptime').textContent = devices[0]["Uptime"] || 'N/A';
        } else {
            console.warn('Données manquantes pour le Router 1');
        }

        // Vérifier et insérer les données pour le Router 2
        if (devices && devices[1]) {
            document.getElementById('router2-cpu').textContent = `${devices[1]["CPU-Usage"] || 'N/A'}%`;
            document.getElementById('router2-ram').textContent = `${devices[1]["RAM-Usage"] || 'N/A'}%`;
            document.getElementById('router2-uptime').textContent = devices[1]["Uptime"] || 'N/A';
        } else {
            console.warn('Données manquantes pour le Router 2');
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques des routeurs :', error);
    }
}

// Charger les données au chargement de la page
document.addEventListener('DOMContentLoaded', fetchStats);



// Charger les données au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    fetchRouter1();
    fetchRouter2();
    fetchPCInfo();
});

