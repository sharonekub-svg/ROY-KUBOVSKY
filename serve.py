#!/usr/bin/env python3
"""שרת מקומי לתצוגה מקדימה של האתר.  הרצה:  python3 serve.py"""
import http.server, socketserver, webbrowser, os, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("  %s\n" % (fmt % args))


with socketserver.TCPServer(("", PORT), Handler) as httpd:
    url = "http://localhost:%d/index.html" % PORT
    print("\n  האתר רץ על:  %s" % url)
    print("  לעצירה:  Ctrl+C\n")
    try:
        webbrowser.open(url)
    except Exception:
        pass
    httpd.serve_forever()
