PLATAFORMA DE MARCAS - HTML, CSS, JS Y SUPABASE

ARCHIVOS:
- index.html: pantalla de login
- registro.html: pantalla para crear una cuenta nueva
- dashboard.html: pantalla principal
- marcas.html: registro de entrada, almuerzo y salida
- perfil.html: información laboral del colaborador
- tareas.html: tareas asignadas
- admin.html: panel para asignar tareas
- styles.css: diseño visual
- supabaseClient.js: conexión con Supabase
- auth.js: inicio de sesión
- registro.js: registro de usuarios
- app.js: funciones principales
- database.sql: tablas para Supabase

PASOS:
1. Crear un proyecto en Supabase.
2. Ir a SQL Editor.
3. Copiar y ejecutar el contenido de database.sql.
4. Ir a Authentication > Users y crear usuarios.
5. Copiar el ID de cada usuario.
6. Insertar esos IDs en la tabla colaboradores.
7. Abrir supabaseClient.js.
8. Pegar el Project URL y la anon/public key.
9. Abrir index.html en el navegador.

NOTA:
Este proyecto es una base funcional y sencilla. Se puede mejorar agregando reportes, filtros por fecha, edición de tareas y control más avanzado de permisos.


REGISTRO DE USUARIOS:
Ahora el proyecto incluye registro.html.
Desde el login se puede entrar a "Registrarse aquí".
El registro crea un usuario en Supabase Auth y también guarda los datos en la tabla colaboradores.

IMPORTANTE:
Si Supabase tiene activada la confirmación por correo, el usuario deberá confirmar su email antes de iniciar sesión.
Para una prueba de clase, se puede revisar en Supabase:
Authentication > Providers > Email
y ajustar la confirmación según lo que necesiten.
