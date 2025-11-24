import mysql from "mysql2/promise";
import * as fs from "fs";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

async function importLocations() {
  console.log("Loading JSON data...");
  
  // Read JSON file
  const data = JSON.parse(fs.readFileSync('/home/ubuntu/FINAL_GTGOTG_COMPLETE.json', 'utf8'));
  console.log(`Loaded ${data.length} locations from JSON`);
  
  const BATCH_SIZE = 1000;
  let totalImported = 0;
  
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    
    const values = batch.map(loc => [
      loc.id || `loc_${i}`,
      loc.name || 'Unknown',
      loc.category || 'Unknown',
      loc.subcategory || null,
      String(loc.latitude),
      String(loc.longitude),
      null, // street
      null, // city
      loc.state || null,
      null, // postcode
      null, // phone
      null, // website
      null, // brand
      loc.has_restroom ? 1 : 0,
      loc.restroom_type === 'public' ? 'public' : 'customer',
      String(loc.restroom_confidence || 0.8),
      loc.source || 'OpenStreetMap',
    ]);
    
    const placeholders = values.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').join(',');
    const flatValues = values.flat();
    
    try {
      await connection.execute(
        `INSERT IGNORE INTO locations (externalId, name, category, subcategory, latitude, longitude, street, city, state, postcode, phone, website, brand, hasRestroom, restroomType, restroomConfidence, source) VALUES ${placeholders}`,
        flatValues
      );
      
      totalImported += batch.length;
      console.log(`Imported ${totalImported}/${data.length} locations (${Math.round(totalImported/data.length*100)}%)`);
    } catch (error) {
      console.error(`Error at batch ${i}:`, error.message);
    }
  }
  
  await connection.end();
  console.log(`\nImport complete! Total: ${totalImported} locations`);
  process.exit(0);
}

importLocations().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
