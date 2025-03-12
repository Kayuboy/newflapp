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
}

// Deklarace pro rozšíření globálního objektu
declare global {
  var mongooseConnection: MongooseConnection | undefined;
}

// Vyčištění existujícího připojení
if (global.mongooseConnection?.conn) {
  global.mongooseConnection.conn.disconnect();
  global.mongooseConnection = undefined;
}

// Inicializace cache
let cached: MongooseConnection = global.mongooseConnection || {
  conn: null,
  promise: null,
};

global.mongooseConnection = cached;

/**
 * Funkce pro připojení k MongoDB
 */
export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Připojuji k MongoDB s URI:', MONGODB_URI);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Úspěšně připojeno k MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error('Chyba při připojování k MongoDB:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
} 