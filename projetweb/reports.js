document.getElementById('rapportForm').addEventListener('submit', async function (event) {
    event.preventDefault(); 

    let messageDiv = document.getElementById('message');
    messageDiv.style.display = 'none'; 
    messageDiv.classList.remove('success', 'error');

    
    let nom = document.getElementById('nom').value.trim();
    let prenom = document.getElementById('prenom').value.trim();
    let email = document.getElementById('email').value.trim();
    let matricule = document.getElementById('matricule').value.trim();
    let telephone = document.getElementById('numero de telephone').value.trim();
    let date = document.getElementById('date').value.trim();
    let sujet = document.getElementById('sujet').value.trim();
    let description = document.getElementById('description').value.trim();

    
    if (!nom || !prenom || !email || !matricule || !telephone || !date || !sujet || !description) {
        messageDiv.style.display = 'block';
        messageDiv.classList.add('error');
        messageDiv.textContent = "All fields must be completed!";
        return;
    }

    
    telephone = telephone.replace(/\s+/g, ''); 
    let phonePattern = /^07\d{8}$/;
    if (!phonePattern.test(telephone)) {
        messageDiv.style.display = 'block';
        messageDiv.classList.add('error');
        messageDiv.textContent = "The phone number must start with '07' and be followed by 8 digits.";
        return;
    }

    // Préparer les données à envoyer au backend
    const formData = {
        nom,
        prenom,
        email,
        matricule,
        "numero de telephone": telephone,
        date,
        sujet,
        description
    };

    try {
        
        const response = await fetch('/submit-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            
            messageDiv.style.display = 'block';
            messageDiv.classList.add('success');
            messageDiv.textContent = "The report has been submitted successfully!";

            
            let lastSubmitTime = localStorage.getItem('lastSubmitTime');
            let currentTime = new Date().getTime(); 

            if (lastSubmitTime) {
                let timeDifference = currentTime - lastSubmitTime; 

                
                if (timeDifference >= 86400000) {
                    localStorage.setItem('compteur', 0); 
                }
            }

            
            let compteur = localStorage.getItem('compteur') || 0;
            compteur = parseInt(compteur) + 1; 

            
            localStorage.setItem('compteur', compteur);
            localStorage.setItem('lastSubmitTime', currentTime);

            
            setTimeout(() => {
                window.location.href = "page.html"; 
            }, 2000); 
        } else {
            
            messageDiv.style.display = 'block';
            messageDiv.classList.add('error');
            messageDiv.textContent = result.error || "Failed to submit report.";
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.style.display = 'block';
        messageDiv.classList.add('error');
        messageDiv.textContent = "An unexpected error occurred. Please try again later.";
    }
});
