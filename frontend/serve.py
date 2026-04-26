"""
Frontend dev server with correct MIME types for ES modules.
Fixes Windows registry issue where .js may be mapped to text/plain.
"""
import http.server
import mimetypes
import os

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress noisy per-request logs

if __name__ == "__main__":
    server = http.server.HTTPServer(("127.0.0.1", 5500), Handler)
    print("Frontend serving at http://127.0.0.1:5500")
    server.serve_forever()
