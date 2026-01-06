from flask_mail import Message
from app.extensions import mail
from flask import current_app, copy_current_request_context
import os
import threading

def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
            print("Email sent successfully!")
        except Exception as e:
            print(f"Failed to send email: {e}")

def send_email_with_attachment(recipient_email, subject, body, attachment_path):
    sender_email = current_app.config.get('MAIL_USERNAME')
    
    if not sender_email:
        print("Error: Mail credentials not configured.")
        return False

    msg = Message(subject, recipients=[recipient_email])
    msg.body = body
    
    # Read the attachment into memory immediately, because the thread won't work well with request context for paths
    if attachment_path and os.path.exists(attachment_path):
        filename = os.path.basename(attachment_path)
        with open(attachment_path, "rb") as f:
             # We must read the file here, before spawning thread
            file_data = f.read()
        
        msg.attach(filename, "application/pdf", file_data)
    else:
        print(f"Warning: Attachment not found at {attachment_path}")

    # Use threading to send without blocking
    # We pass the real app object (via proxy) to the thread
    app = current_app._get_current_object()
    
    thread = threading.Thread(target=send_async_email, args=(app, msg))
    thread.start()
    
    return True
