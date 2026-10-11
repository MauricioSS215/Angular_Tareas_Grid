import pg from "pg";

// pg utiliza PGHOST, PGPORT, PGUSER, PGPASSWORD y PGDATABASE del entorno.
export const myPool = new pg.Pool({ connectionTimeoutMillis: 5000 });
