// Se obtiene el formulario del login
const loginForm = document.getElementById("loginForm");

// Se obtiene el elemento donde se muestran mensajes (error o estado)
const mensaje = document.getElementById("mensaje");

// Se ejecuta cuando el usuario presiona el botón de iniciar sesión
loginForm.addEventListener("submit", async function (evento) {

  // Evita que la página se recargue automáticamente
  evento.preventDefault();

  // Se obtienen los valores ingresados por el usuario
  // elimina espacios en blanco antes o después
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Mensaje mientras se valida la información
  mensaje.textContent = "Ingresando...";

  // Se consulta la tabla "usuarios" en Supabase
  // Se busca un registro que coincida con el correo y contraseña
  const { data, error } = await db
    .from("usuarios")
    .select("*")
    .eq("correo", email)
    .eq("contrasena", password)
    .single();

  // Si ocurre un error o no se encuentra el usuario
  if (error || !data) {
    mensaje.textContent = "Correo o contraseña incorrectos.";
    console.log("Error login:", error);
    return;
  }

  // Si el login es correcto
  // Se guarda el usuario en el navegador
  // Esto permite mantener la sesión activa
  localStorage.setItem("usuarioActual", JSON.stringify(data));

  // Se redirige al usuario al dashboard (pantalla principal)
  window.location.href = "dashboard.html";
});