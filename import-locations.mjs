import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as fs from "fs";
import * as readline from "readline";

// Create connection
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

async function importLocations() {
  console.log("Starting location import...");
  
  const fileStream = fs.createReadStream('/home/ubuntu/FINAL_GTGOTG_COMPLETE.csv');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let batch = [];
  let totalImported = 0;
  let lineNumber = 0;
  const BATCH_SIZE = 500;

  for await (const line of rl) {
    lineNumber++;
    
    // Skip header
    if (lineNumber === 1) continue;
    
    // Parse CSV line (simple parser, assumes no commas in quoted fields)
    const fields = line.split(',');
    
    if (fields.length < 17) {
      console.warn(`Skipping malformed line ${lineNumber}`);
      continue;
    }

    const [id, name, category, subcategory, latitude, longitude, street, city, state, postcode, phone, website, brand, hasRestroom, restroomType, restroomConfidence, source] = fields;

    // Skip if no coordinates
    if (!latitude || !longitude || latitude === '' || longitude === '') {
      continue;
    }

    batch.push([
      id.trim(),
      name.trim() || 'Unknown',
      category.trim(),
      subcategory?.trim() || null,
      latitude.trim(),
      longitude.trim(),
      street?.trim() || null,
      city?.trim() || null,
      state?.trim() || null,
      postcode?.trim() || null,
      phone?.trim() || null,
      website?.trim() || null,
      brand?.trim() || null,
      hasRestroom === 'True' || hasRestroom === 'true' || hasRestroom === '1' ? 1 : 0,
      restroomType?.trim() === 'public' ? 'public' : 'customer',
      restroomConfidence?.trim() || '0.8',
      source?.trim() || 'OpenStreetMap',
    ]);

    // Insert batch when it reaches BATCH_SIZE
    if (batch.length >= BATCH_SIZE) {
      try {
        const placeholders = batch.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').join(',');
        const values = batch.flat();
        
        await connection.execute(
          `INSERT INTO locations (externalId, name, category, subcategory, latitude, longitude, street, city, state, postcode, phone, website, brand, hasRestroom, restroomType, restroomConfidence, source) VALUES ${placeholders}`,
          values
        );
        
        totalImported += batch.length;
        console.log(`Imported ${totalImported} locations...`);
        batch = [];
      } catch (error) {
        console.error(`Error inserting batch at line ${lineNumber}:`, error.message);
        // Continue with next batch
        batch = [];
      }
    }
  }

  // Insert remaining batch
  if (batch.length > 0) {
    try {
      const placeholders = batch.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').join(',');
      const values = batch.flat();
      
      await connection.execute(
        `INSERT INTO locations (externalId, name, category, subcategory, latitude, longitude, street, city, state, postcode, phone, website, brand, hasRestroom, restroomType, restroomConfidence, source) VALUES ${placeholders}`,
        values
      );
      
      totalImported += batch.length;
    } catch (error) {
      console.error(`Error inserting final batch:`, error.message);
    }
  }

  await connection.end();
  console.log(`\nImport complete! Total locations imported: ${totalImported}`);
  process.exit(0);
}

importLocations().catch(error => {
  console.error("Fatal error during import:", error);
  process.exit(1);
});
