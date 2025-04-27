export function logDetailedError(err, req, functionName) {
    const isDev = process.env.NODE_ENV !== "production";
  
    console.error("=== Error capturado ===");
    console.error("Función:", functionName);
    console.error("Ruta:", req.method, req.originalUrl);
    console.error("Error:", err.message);
    
    if (isDev) {
      console.error("Headers:", req.headers);
      console.error("Body:", req.body);
      console.error("Stacktrace:\n", err.stack);
    }
    console.error("========================");
  }
  