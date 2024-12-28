// Fonction pour récupérer et afficher le compteur du dashboard
function updateDashboardCounter() {
    let compteur = localStorage.getItem('compteur') || 0;  // Récupère la valeur du compteur, ou 0 si non défini
    document.getElementById('dashboardCounter').innerText = compteur;
}

// Fonction pour réinitialiser le compteur
function resetCounter() {
    localStorage.setItem('compteur', 0);  // Réinitialise le compteur
    updateDashboardCounter();  // Met à jour l'affichage du compteur
}

// Initialisation du tableau de bord lors du chargement de la page
window.onload = function() {
    updateDashboardCounter();  // Met à jour l'affichage du compteur
};