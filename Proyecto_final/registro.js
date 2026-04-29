/*
  Este archivo registra usuarios directamente en la tabla usuarios.
  No usa Supabase Authentication.
*/

const registroForm = document.getElementById("registroForm");
const mensaje = document.getElementById("mensaje");

function calcularDiasVacaciones(fechaIngreso) {
  const ingreso = new Date(fechaIngreso);
  const hoy = new Date();

  let meses = (hoy.getFullYear() - ingreso.getFullYear()) * 12;
  meses += hoy.getMonth() - ingreso.getMonth();

  if (hoy.getDate() < ingreso.getDate()) {
    meses--;
  }

  if (meses < 0) {
    meses = 0;
  }

  return meses;
}

registroForm.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const fechaIngreso = document.getElementById("fechaIngreso").value;
  const idEmpleado = document.getElementById("idEmpleado").value.trim();
  const area = document.getElementById("area").value.trim();
  const turno = document.getElementById("turno").value;

  if (password === "") {
    mensaje.textContent = "Debe ingresar una contraseña.";
    return;
  }

  const diasVacaciones = calcularDiasVacaciones(fechaIngreso);

  mensaje.textContent = "Registrando usuario...";

  const { error } = await db
    .from("usuarios")
    .insert({
      nombre: nombre,
      correo: email,
      contrasena: password,
      id_empleado: idEmpleado,
      fecha_ingreso: fechaIngreso,
      area: area,
      turno: turno,
      dias_vacaciones: diasVacaciones,
      rol: "colaborador"
    });

  if (error) {
    mensaje.textContent = "Error: " + error.message;
    console.log("Error completo:", error);
    return;
  }

  mensaje.textContent = "Usuario registrado correctamente.";
  registroForm.reset();

  setTimeout(function () {
    window.location.href = "index.html";
  }, 1500);
});