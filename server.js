const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { exec } = require('child_process');

const app = express();

// MongoDB connection setup
mongoose.connect('mongodb://localhost:27017/snmp-monitor', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques depuis "projetweb"
app.use(express.static(path.join(__dirname, 'projetweb')));

// Schéma pour les utilisateurs
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Schéma pour les données SNMP
const deviceSchema = new mongoose.Schema({
  IP: String,
  Uptime: String,
  Description: String,
  CPU_Load: String,
  Memory_Usage: String,
  Interfaces: Array,
  Bytes_Sent: Number,
  Bytes_Received: Number,
  timestamp: { type: Date, default: Date.now },
});

// Schéma pour les rapports
const reportSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  email: String,
  matricule: String,
  numeroDeTelephone: String,
  date: Date,
  sujet: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Device = mongoose.model('Device', deviceSchema);
const Report = mongoose.model('Report', reportSchema);

// Routes d'authentification
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering user.');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials.');
    }
    const token = jwt.sign({ id: user._id }, 'your_secret_key', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in.');
  }
});

// Route par défaut pour rediriger vers la page de connexion
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'projetweb','Login.html'));
});

// Endpoint pour soumettre un rapport
app.post('/submit-report', async (req, res) => {
  console.log('Data received:', req.body); // Debugging log
  try {
    const report = new Report(req.body);
    await report.save();
    console.log('Report saved:', report); // Debugging log
    res.status(201).json({ message: 'Report saved successfully' });
  } catch (err) {
    console.error('Error saving report:', err);
    res.status(500).json({ error: 'Failed to save report', details: err });
  }
});



// Endpoint pour collecter les données SNMP via un script Python
app.get('/api/devices', async (req, res) => {
  try {
    exec('python3 collect_snmp_data.py', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send('Error collecting SNMP data');
      }

      const snmpData = JSON.parse(stdout);

      // Enregistrer les données dans MongoDB
      snmpData.forEach(async (deviceData) => {
        const device = new Device(deviceData);
        await device.save();
      });

      res.json(snmpData);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data');
  }
});

// Endpoint pour collecter les données système du PC
app.get('/api/system', async (req, res) => {
  try {
    exec('python3 collect_system_performance.py', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send('Error collecting system data');
      }

      const systemData = JSON.parse(stdout);

      // Ajouter les données au JSON de sortie
      res.json(systemData);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching system data');
  }
});

// Endpoint pour obtenir les données d'un appareil spécifique
app.get('/api/device/:ip', async (req, res) => {
  const deviceIp = req.params.ip;
  try {
    const device = await Device.findOne({ IP: deviceIp });
    if (device) {
      return res.json(device);
    }
    return res.status(404).send('Device not found');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching device data.');
  }
});
app.get('/api/user-count', async (req, res) => {
    try {
        const userCount = await User.countDocuments(); // Compte les utilisateurs dans la collection
        res.json({ count: userCount });
    } catch (error) {
        console.error('Error fetching user count:', error);
        res.status(500).json({ error: 'Failed to fetch user count' });
    }
});


app.get('/api/user', async (req, res) => {
  try {
    // Exemple : Décoder le JWT pour obtenir l'ID utilisateur
    const token = req.headers.authorization?.split(' ')[1]; // Format "Bearer <token>"
    if (!token) {
      return res.status(401).send('Unauthorized');
    }

    const decoded = jwt.verify(token, 'your_secret_key');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json({ username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to fetch user info.');
  }
});
const viewSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // Date sous format YYYY-MM-DD
    views: { type: Number, default: 0 }, // Nombre de vues pour ce jour
});

const View = mongoose.model('View', viewSchema);
app.use(async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // Date actuelle au format YYYY-MM-DD

        // Trouver ou créer une entrée pour aujourd'hui
        const view = await View.findOneAndUpdate(
            { date: today },
            { $inc: { views: 1 } }, // Incrémenter le compteur de vues
            { new: true, upsert: true } // Crée une entrée si elle n'existe pas
        );

        next(); // Continuer vers la prochaine route
    } catch (error) {
        console.error('Error updating daily views:', error);
        next(); // Continuer même en cas d'erreur
    }
});

app.get('/api/daily-views', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // Date actuelle au format YYYY-MM-DD
        const view = await View.findOne({ date: today });

        res.json({ views: view ? view.views : 0 }); // Retourne 0 si aucune vue n'est enregistrée
    } catch (error) {
        console.error('Error fetching daily views:', error);
        res.status(500).json({ error: 'Failed to fetch daily views' });
    }
});

// Démarrage du serveur
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

