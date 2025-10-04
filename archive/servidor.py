import http.server
import socketserver
import webbrowser
import os
import sys

# Cambiar al directorio del proyecto
os.chdir(r'd:\LaSalle\Hackathon')

PORT = 8080

Handler = http.server.SimpleHTTPRequestHandler

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🌍 Servidor iniciado en http://localhost:{PORT}")
        print("📂 Sirviendo archivos desde:", os.getcwd())
        print("🚀 Abriendo navegador...")
        
        # Abrir navegador automáticamente
        webbrowser.open(f'http://localhost:{PORT}/test.html')
        
        print("🛑 Presiona Ctrl+C para detener el servidor")
        httpd.serve_forever()
        
except KeyboardInterrupt:
    print("\n🛑 Servidor detenido")
    sys.exit(0)
except OSError as e:
    print(f"❌ Error: {e}")
    print(f"💡 Intenta cambiar el puerto o cerrar otras aplicaciones")
    sys.exit(1)