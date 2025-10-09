const API_BASE_URL = "https://api.policeroleplay.community/v1/server";

exports.handler = async (event, context) => {
  // Permitir CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Manejar preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const servers = [
      {
        name: "MXRP",
        players: 0,
        maxPlayers: 40,
        status: "offline",
        serverKey: process.env.MXRP || "",
      },
      {
        name: "MXRP B",
        players: 0,
        maxPlayers: 40,
        status: "offline",
        serverKey: process.env.MXRPB || "",
      },
      {
        name: "MXRP C",
        players: 0,
        maxPlayers: 40,
        status: "offline",
        serverKey: process.env.MXRPC || "",
      },
    ];

    // Fetch data for each server
    const serverPromises = servers.map(async (server) => {
      if (!server.serverKey) {
        return {
          ...server,
          status: "error",
          error: "Server key not configured",
        };
      }

      try {
        const response = await fetch(API_BASE_URL, {
          method: "GET",
          headers: {
            "server-key": server.serverKey,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const currentPlayers = data.CurrentPlayers || 0;
        const maxPlayers = data.MaxPlayers || 40;

        return {
          ...server,
          players: currentPlayers,
          maxPlayers: maxPlayers,
          status: currentPlayers > 0 ? "online" : "offline",
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Error fetching data for ${server.name}:`, error);
        return {
          ...server,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    const results = await Promise.all(serverPromises);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        servers: results,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("Error in servers function:", error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
