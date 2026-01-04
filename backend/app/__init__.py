from flask import Flask
from flask_cors import CORS
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize CORS
    # Initialize CORS
    CORS(app, origins="*")
    
    # Initialize Firebase (placeholder for now)
    from app.services.firebase_db import initialize_firebase
    initialize_firebase(app)

    # Register Blueprints
    from app.routes import main_bp
    app.register_blueprint(main_bp)

    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'AI Interviewer Backend'}

    return app
