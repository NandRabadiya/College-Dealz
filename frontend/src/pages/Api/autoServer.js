// autoServer.js

const SERVER_PREFERENCES = [
    'http://localhost:8080',
    'http://ec2-3-238-116-245.compute-1.amazonaws.com:8080',
    'https://college-dealz.up.railway.app'
  ];
  
  let LOCALHOST = SERVER_PREFERENCES[0]; // default fallback
  
  function checkServerAvailable(url) {
    return fetch(url, { method: 'HEAD', mode: 'no-cors' })
      .then(() => true)
      .catch(() => false);
  }
  
  async function findAvailableServer() {
    for (const server of SERVER_PREFERENCES) {
      const isUp = await checkServerAvailable(server);
      if (isUp) {
        console.log(`✅ Using backend: ${server}`);
        LOCALHOST = server;
        break;
      } else {
        console.warn(`❌ Server not reachable: ${server}`);
      }
    }
  }
  
  let initialized = false;
  
  // Exported function to call before using the API
  export const getApiBaseUrl = async () => {
    if (!initialized) {
      await findAvailableServer();
      initialized = true;
    }
    return LOCALHOST;
  };
  