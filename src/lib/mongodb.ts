import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Prosím definujte proměnnou MONGODB_URI v souboru .env'
  );
}

// Globální proměnná pro uchování připojení k MongoDB
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  lastConnectionTime: number;
}

// Deklarace pro rozšíření globálního objektu
declare global {
  var mongooseConnection: MongooseConnection | undefined;
}

// Nastavení pro optimalizaci MongoDB
const MONGODB_OPTIONS = {
  bufferCommands: false,
  maxPoolSize: 10, // Maximální počet připojení v poolu
  minPoolSize: 5,  // Udržuj alespoň 5 připojení
  socketTimeoutMS: 45000, // Timeout pro socket operace
  connectTimeoutMS: 10000, // Timeout pro připojení
  serverSelectionTimeoutMS: 10000, // Timeout pro výběr serveru
  heartbeatFrequencyMS: 30000, // Kontrola dostupnosti serveru každých 30 sekund
};

// Inicializace cache
let cached: MongooseConnection = global.mongooseConnection || {
  conn: null,
  promise: null,
  lastConnectionTime: 0,
};

global.mongooseConnection = cached;

// Funkce pro kontrolu health stavu připojení
function isConnectionHealthy(): boolean {
  if (!cached.conn) return false;
  return mongoose.connection.readyState === 1; // 1 = připojeno
}

/**
 * Funkce pro připojení k MongoDB s optimalizací výkonu
 */
export async function connectToDatabase() {
  // Pokud už máme připojení a je zdravé, vrať ho
  if (cached.conn && isConnectionHealthy()) {
    return cached.conn;
  }

  // Pokud probíhá připojování, počkej na výsledek
  if (cached.promise) {
    try {
      await cached.promise;
      if (isConnectionHealthy()) {
        return cached.conn;
      }
      // Pokud připojení není zdravé, pokračuj a zkus se připojit znovu
    } catch (e) {
      console.warn('Předchozí pokus o připojení selhal, zkouším znovu');
    }
  }

  // Vytvoř nové připojení
  console.log('Připojuji k MongoDB...');
  cached.promise = mongoose.connect(MONGODB_URI, MONGODB_OPTIONS).then((mongoose) => {
    console.log('Úspěšně připojeno k MongoDB');
    cached.lastConnectionTime = Date.now();
    return mongoose;
  });

  try {
    cached.conn = await cached.promise;
    
    // Přidej event listenery pro sledování stavu připojení
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB odpojeno, pokusím se znovu připojit');
      cached.conn = null;
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB chyba připojení:', err);
      cached.conn = null;
    });
    
  } catch (e) {
    console.error('Chyba při připojování k MongoDB:', e);
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

// Export funkce pro zdravotní kontrolu
export function checkDatabaseHealth() {
  return {
    isConnected: isConnectionHealthy(),
    lastConnectionTime: cached.lastConnectionTime,
    readyState: mongoose.connection.readyState,
  };
} 