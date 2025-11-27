const ftp = require('ftp');
const fs = require('fs');
const path = require('path');

const FTP_CONFIG = {
  host: '89.117.169.72',
  user: 'u679468784',
  password: 'tLzhLZFs6VjYwS8DGAFx45GvatGxF',
  port: 21
};

const OUT_DIR = path.join(__dirname, '..', 'out');
const REMOTE_DIR = '/public_html';

function uploadDirectory(ftpClient, localDir, remoteDir) {
  return new Promise((resolve, reject) => {
    ftpClient.cwd(remoteDir, (err) => {
      if (err) {
        return reject(err);
      }

      const files = fs.readdirSync(localDir);
      let uploaded = 0;
      let failed = 0;

      if (files.length === 0) {
        return resolve();
      }

      files.forEach((file) => {
        const localPath = path.join(localDir, file);
        const remotePath = path.join(remoteDir, file).replace(/\\/g, '/');

        fs.stat(localPath, (err, stats) => {
          if (err) {
            console.error(`Error reading ${localPath}:`, err);
            failed++;
            if (uploaded + failed === files.length) {
              resolve();
            }
            return;
          }

          if (stats.isDirectory()) {
            ftpClient.mkdir(remotePath, true, (err) => {
              if (err && err.code !== 550) {
                console.error(`Error creating directory ${remotePath}:`, err);
              }
              uploadDirectory(ftpClient, localPath, remotePath)
                .then(() => {
                  uploaded++;
                  if (uploaded + failed === files.length) {
                    resolve();
                  }
                })
                .catch((err) => {
                  console.error(`Error uploading directory ${remotePath}:`, err);
                  failed++;
                  if (uploaded + failed === files.length) {
                    resolve();
                  }
                });
            });
          } else {
            const readStream = fs.createReadStream(localPath);
            ftpClient.put(readStream, file, (err) => {
              if (err) {
                console.error(`Error uploading ${file}:`, err);
                failed++;
              } else {
                console.log(`✓ Uploaded: ${file}`);
                uploaded++;
              }
              if (uploaded + failed === files.length) {
                resolve();
              }
            });
          }
        });
      });
    });
  });
}

function deploy() {
  if (!fs.existsSync(OUT_DIR)) {
    console.error('❌ Build directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  console.log('🚀 Starting FTP deployment...');
  console.log(`📁 Uploading from: ${OUT_DIR}`);
  console.log(`📁 Uploading to: ${REMOTE_DIR}`);

  const client = new ftp();

  client.on('ready', () => {
    console.log('✓ Connected to FTP server');
    
    uploadDirectory(client, OUT_DIR, REMOTE_DIR)
      .then(() => {
        console.log('\n✅ Deployment completed!');
        client.end();
      })
      .catch((err) => {
        console.error('\n❌ Deployment failed:', err);
        client.end();
        process.exit(1);
      });
  });

  client.on('error', (err) => {
    console.error('❌ FTP connection error:', err);
    process.exit(1);
  });

  client.connect(FTP_CONFIG);
}

deploy();

