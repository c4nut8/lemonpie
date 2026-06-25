from werkzeug.security import generate_password_hash

admin_hash = generate_password_hash("Admin123*")
viewer_hash = generate_password_hash("Viewer123*")

print("ADMIN:")
print(admin_hash)

print("\nVIEWER:")
print(viewer_hash)