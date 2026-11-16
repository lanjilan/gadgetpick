import {readFile,writeFile} from 'node:fs/promises';
import {prepareImport} from '../public/importer.js';
const [csvPath,configPath,...args]=process.argv.slice(2);
if(!csvPath||!configPath){console.error('Pakai: npm run import:csv -- file.csv mapping.json [--out staging.sql]');process.exit(1);}
try{
  const result=prepareImport(await readFile(csvPath,'utf8'),JSON.parse(await readFile(configPath,'utf8')));
  console.log(JSON.stringify({total:result.total,valid:result.valid.length,errors:result.errors},null,2));
  if(result.errors.length)process.exitCode=1;
  else if(args[0]==='--out'&&args[1]){
    const batchId=crypto.randomUUID(),q=s=>`'${String(s).replaceAll("'","''")}'`;
    const sql=['PRAGMA foreign_keys = ON;','BEGIN TRANSACTION;',`INSERT INTO import_batches(id,origin,source_origin,row_count) VALUES(${q(batchId)},'shopee_csv',${q(result.valid[0]?.sourceOrigin||'shopee_csv')},${result.valid.length});`,...result.valid.map(r=>`INSERT INTO import_rows(batch_id,external_id,payload_json) VALUES(${q(batchId)},${q(r.externalId)},${q(JSON.stringify(r))});`),'COMMIT;'].join('\n');
    await writeFile(args[1],sql);console.log(`SQL staging ditulis ke ${args[1]}. Tidak ada data dipublikasikan.`);
  }
}catch(e){console.error(e.message);process.exitCode=1;}
