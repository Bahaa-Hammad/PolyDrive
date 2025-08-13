export default () => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
    username: process.env.DATABASE_USER || 'polydrive',
    password: process.env.DATABASE_PASSWORD || 'polydrive123',
    database: process.env.DATABASE_NAME || 'polydrive',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  storage: {
    type: process.env.STORAGE_TYPE || 's3', // 'local' | 's3' | 'database' | 'ftp'
    local: {
      path: process.env.LOCAL_STORAGE_PATH || './storage',
    },
    s3: {
        endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
        accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretKey: process.env.S3_SECRET_KEY || 'minioadmin',
        bucket: process.env.S3_BUCKET || 'polydrive',
        region: process.env.S3_REGION || 'us-east-1',
      },
    ftp: {
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: process.env.FTP_PORT ? parseInt(process.env.FTP_PORT, 10) : 21,
    },
  },
}); 