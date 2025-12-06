import sys
import os
import webbrowser
from threading import Timer
from http.server import HTTPServer, SimpleHTTPRequestHandler

def get_base_path():
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return base_path

def get_exe_dir():
    """ Get the directory where the executable (or script) is located """
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    else:
        return os.path.dirname(os.path.abspath(__file__))

class CustomHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Logic to allow external config.json override
        # Get the normalized path (removing query strings etc) handled by super() logic mostly
        # But we need to intercept before super().translate_path if we want to change the source root
        
        # Simple check: if the request is for config.json
        clean_path = path.split('?', 1)[0].split('#', 1)[0]
        
        if clean_path.endswith('/config.json') or clean_path == '/config.json':
            exe_dir = get_exe_dir()
            user_config = os.path.join(exe_dir, 'config.json')
            if os.path.exists(user_config):
                return user_config
        
        return super().translate_path(path)

    def __init__(self, *args, **kwargs):
        # Serve files from the internal resource directory (_MEIPASS) by default
        super().__init__(*args, directory=get_base_path(), **kwargs)

def open_browser(port):
    webbrowser.open_new(f'http://127.0.0.1:{port}/index.html')

def run():
    # Use port 0 to let OS assign a free port
    # We try a fixed port first for predictability, then fallback
    target_port = 8999
    server_address = ('127.0.0.1', target_port)
    
    try:
        httpd = HTTPServer(server_address, CustomHandler)
    except OSError:
        # Fallback to random free port
        server_address = ('127.0.0.1', 0)
        httpd = HTTPServer(server_address, CustomHandler)
        target_port = httpd.server_address[1]

    print(f"Starting WebAR Server on port {target_port}...")
    print("Press Ctrl+C to exit.")
    
    # Open browser after a slight delay
    Timer(1.0, open_browser, [target_port]).start()
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    run()
