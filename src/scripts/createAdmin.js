require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Připojení k MongoDB
async function connectToDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('MongoDB URI není definována v .env souboru');
      process.exit(1);
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Připojeno k MongoDB úspěšně');
  } catch (error) {
    console.error('Chyba při připojování k MongoDB:', error);
    process.exit(1);
  }
}

// Definice schématu uživatele
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: true,
  },
});

// Přidání metody pro hashování hesla
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

// Vytvoření defaultního administrátora
async function createDefaultAdmin() {
  try {
    // Kontrola, zda už admin existuje
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Administrátor již existuje');
      return;
    }
    
    // Vytvoření nového administrátora
    const defaultPassword = 'admin123';
    const newAdmin = new User({
      username: 'admin',
      password: defaultPassword,
      isAdmin: true,
    });
    
    await newAdmin.save();
    console.log('Defaultní administrátor vytvořen:');
    console.log('Username: admin');
    console.log('Password:', defaultPassword);
    console.log('!!! DŮLEŽITÉ: Změňte toto heslo co nejdříve !!!');
  } catch (error) {
    console.error('Chyba při vytváření administrátora:', error);
  }
}

// Spuštění skriptu
async function run() {
  try {
    await connectToDatabase();
    await createDefaultAdmin();
  } catch (error) {
    console.error('Chyba při spouštění skriptu:', error);
  } finally {
    // Ukončení připojení k databázi
    await mongoose.connection.close();
    console.log('Připojení k databázi ukončeno');
    process.exit(0);
  }
}

run(); 