import { createServer } from 'vite';

async function start() {
  try {
    const server = await createServer({
      configFile: './vite.config.ts',
    });
    
    await server.listen();
    
    server.printUrls();
    
    console.log('✅ Vite server started successfully!');
  } catch (error) {
    console.error('❌ Failed to start Vite server:');
    console.error(error);
    process.exit(1);
  }
}

start();
