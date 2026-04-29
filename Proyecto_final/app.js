/*
  Maneja:
  - Sesión con localStorage
  - Marcas
  - Perfil
  - Tareas
  - Admin
  - Vacaciones
*/

let usuarioActual = null;
let colaboradorActual = null;
let tareasPrevias = 0;

document.addEventListener("DOMContentLoaded", async function () {
  verificarSesion();

  const btnSalir = document.getElementById("btnSalir");
  if (btnSalir) btnSalir.addEventListener("click", cerrarSesion);

  const pagina = window.location.pathname.split("/").pop();

  if (pagina === "dashboard.html") cargarDashboard();
  if (pagina === "marcas.html") cargarMarcas();
  if (pagina === "perfil.html") cargarPerfil();
  if (pagina === "tareas.html") cargarTareas();
  if (pagina === "admin.html") cargarAdmin();
  if (pagina === "vacaciones.html") cargarVacaciones();
});

function verificarSesion() {
  const usuarioGuardado = localStorage.getItem("usuarioActual");

  if (!usuarioGuardado) {
    window.location.href = "index.html";
    return;
  }

  colaboradorActual = JSON.parse(usuarioGuardado);
  usuarioActual = colaboradorActual;

  const adminLink = document.getElementById("adminLink");
  if (adminLink && colaboradorActual.rol === "admin") {
    adminLink.classList.remove("oculto");
  }
}

function cerrarSesion() {
  localStorage.removeItem("usuarioActual");
  window.location.href = "index.html";
}

function cargarDashboard() {
  const nombreUsuario = document.getElementById("nombreUsuario");

  if (nombreUsuario) {
    nombreUsuario.textContent = `Hola, ${colaboradorActual.nombre}. Hoy puedes registrar tus marcas, revisar tareas y solicitar vacaciones.`;
  }
}

async function registrarMarca(tipoMarca) {
  const mensaje = document.getElementById("mensaje");
  mensaje.textContent = "Guardando marca...";

  const { error } = await db
    .from("marcas")
    .insert({
      usuario_id: colaboradorActual.id,
      tipo: tipoMarca
    });

  if (error) {
    mensaje.textContent = "Error al guardar la marca.";
    console.log("Error marca:", error);
    return;
  }

  mensaje.textContent = "Marca registrada correctamente.";
  cargarMarcas();
}

async function cargarMarcas() {
  const tabla = document.getElementById("tablaMarcas");
  if (!tabla) return;

  const { data, error } = await db
    .from("marcas")
    .select("*")
    .eq("usuario_id", colaboradorActual.id)
    .order("fecha_hora", { ascending: false })
    .limit(10);

  if (error) {
    tabla.innerHTML = `<tr><td colspan="2">Error al cargar marcas.</td></tr>`;
    console.log("Error historial:", error);
    return;
  }

  if (data.length === 0) {
    tabla.innerHTML = `<tr><td colspan="2">No hay marcas registradas.</td></tr>`;
    return;
  }

  tabla.innerHTML = "";

  data.forEach(function (marca) {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${new Date(marca.fecha_hora).toLocaleString()}</td>
      <td>${formatearTipoMarca(marca.tipo)}</td>
    `;

    tabla.appendChild(fila);
  });
}

function cargarPerfil() {
  const info = document.getElementById("infoColaborador");
  if (!info) return;

  info.innerHTML = `
    <p><strong>Nombre:</strong> ${colaboradorActual.nombre}</p>
    <p><strong>ID de empleado:</strong> ${colaboradorActual.id_empleado}</p>
    <p><strong>Área:</strong> ${colaboradorActual.area}</p>
    <p><strong>Puesto:</strong> ${colaboradorActual.puesto || "Colaborador"}</p>
    <p><strong>Turno:</strong> ${colaboradorActual.turno}</p>
    <p><strong>Fecha de ingreso:</strong> ${colaboradorActual.fecha_ingreso || "No registrada"}</p>
    <p><strong>Días de vacaciones:</strong> ${colaboradorActual.dias_vacaciones}</p>
    <p><strong>Rol:</strong> ${colaboradorActual.rol}</p>
  `;
}

async function cargarTareas() {
  const lista = document.getElementById("listaTareas");
  if (!lista) return;

  const { data, error } = await db
    .from("tareas")
    .select("*")
    .eq("usuario_id", colaboradorActual.id)
    .order("fecha_limite", { ascending: true });

  if (error) {
    lista.innerHTML = "<p>Error al cargar tareas.</p>";
    console.log("Error tareas:", error);
    return;
  }

  if (data.length === 0) {
    lista.innerHTML = "<p>No tiene tareas asignadas.</p>";
    return;
  }

  lista.innerHTML = "";

  data.forEach(function (tarea) {
    const div = document.createElement("div");
    div.classList.add("tarea");

    let botonCompletar = "";

    if (tarea.estado !== "completada") {
      botonCompletar = `
        <button onclick="completarTarea('${tarea.id}')">
          Marcar como completada
        </button>
      `;
    }

    div.innerHTML = `
      <h3>${tarea.titulo}</h3>
      <p>${tarea.descripcion}</p>
      <p><strong>Fecha límite:</strong> ${tarea.fecha_limite || "Sin fecha"}</p>
      <p><strong>Prioridad:</strong> ${tarea.prioridad}</p>
      <p class="estado">Estado: ${tarea.estado}</p>
      ${botonCompletar}
    `;

    lista.appendChild(div);
  });
}

async function completarTarea(tareaId) {
  const { error } = await db
    .from("tareas")
    .update({ estado: "completada" })
    .eq("id", tareaId);

  if (error) {
    alert("Error al completar la tarea.");
    console.log("Error completar tarea:", error);
    return;
  }

  alert("Tarea marcada como completada.");
  cargarTareas();
}

async function cargarAdmin() {
  if (colaboradorActual.rol !== "admin") {
    alert("No tiene permisos para ingresar al panel administrador.");
    window.location.href = "dashboard.html";
    return;
    // Actualiza tareas cada 5 segundos
setInterval(() => {
  cargarTareasFinalizadasAdmin();
}, 5000);
  }

  await cargarColaboradoresAdmin();
  await cargarSolicitudesAdmin();
  await cargarTareasFinalizadasAdmin();

  const formTarea = document.getElementById("formTarea");
  if (formTarea) formTarea.addEventListener("submit", asignarTarea);
}

async function cargarColaboradoresAdmin() {
  const select = document.getElementById("selectColaborador");
  const tabla = document.getElementById("tablaColaboradores");
  const selectMarcas = document.getElementById("selectMarcasColaborador");

  const { data, error } = await db
    .from("usuarios")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    console.log("Error usuarios:", error);
    return;
  }

  if (select) select.innerHTML = `<option value="">Seleccione un colaborador</option>`;
  if (selectMarcas) selectMarcas.innerHTML = `<option value="">Seleccione un colaborador</option>`;
  if (tabla) tabla.innerHTML = "";

  data.forEach(function (colab) {
    if (select) {
      const option = document.createElement("option");
      option.value = colab.id;
      option.textContent = `${colab.id_empleado} - ${colab.nombre}`;
      select.appendChild(option);
    }

    if (selectMarcas) {
      const optionMarcas = document.createElement("option");
      optionMarcas.value = colab.id;
      optionMarcas.textContent = `${colab.id_empleado} - ${colab.nombre}`;
      selectMarcas.appendChild(optionMarcas);
    }

    if (tabla) {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${colab.nombre}</td>
        <td>${colab.area}</td>
        <td>${colab.turno}</td>
        <td>${colab.dias_vacaciones}</td>
      `;
      tabla.appendChild(fila);
    }
  });
}

async function asignarTarea(evento) {
  evento.preventDefault();

  const mensaje = document.getElementById("mensaje");

  const usuarioId = document.getElementById("selectColaborador").value;
  const titulo = document.getElementById("tituloTarea").value;
  const descripcion = document.getElementById("descripcionTarea").value;
  const fechaLimite = document.getElementById("fechaLimite").value;

  mensaje.textContent = "Asignando tarea...";

  const { error } = await db
    .from("tareas")
    .insert({
      usuario_id: usuarioId,
      titulo: titulo,
      descripcion: descripcion,
      fecha_limite: fechaLimite,
      estado: "pendiente",
      prioridad: "normal"
    });

  if (error) {
    mensaje.textContent = "Error al asignar tarea.";
    console.log("Error asignar tarea:", error);
    return;
  }

  mensaje.textContent = "Tarea asignada correctamente.";
  document.getElementById("formTarea").reset();
}

async function cargarVacaciones() {
  const diasDisponibles = document.getElementById("diasDisponibles");
  const formVacaciones = document.getElementById("formVacaciones");

  if (diasDisponibles) {
    diasDisponibles.textContent = colaboradorActual.dias_vacaciones;
  }

  if (formVacaciones) {
    formVacaciones.addEventListener("submit", solicitarVacaciones);
  }

  await cargarMisSolicitudesVacaciones();
}

async function solicitarVacaciones(evento) {
  evento.preventDefault();

  const mensaje = document.getElementById("mensaje");

  const fechaInicio = document.getElementById("fechaInicio").value;
  const fechaFin = document.getElementById("fechaFin").value;
  const motivo = document.getElementById("motivoVacaciones").value;

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  const diferencia = fin - inicio;
  const cantidadDias = Math.floor(diferencia / (1000 * 60 * 60 * 24)) + 1;

  if (cantidadDias <= 0) {
    mensaje.textContent = "La fecha final no puede ser menor que la fecha inicial.";
    return;
  }

  if (cantidadDias > colaboradorActual.dias_vacaciones) {
    mensaje.textContent = "No tiene suficientes días de vacaciones disponibles.";
    return;
  }

  mensaje.textContent = "Enviando solicitud...";

  const { error } = await db
    .from("solicitudes_vacaciones")
    .insert({
      usuario_id: colaboradorActual.id,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      cantidad_dias: cantidadDias,
      motivo: motivo,
      estado: "pendiente"
    });

  if (error) {
    mensaje.textContent = "Error al enviar la solicitud.";
    console.log("Error vacaciones:", error);
    return;
  }

  mensaje.textContent = "Solicitud enviada correctamente.";
  document.getElementById("formVacaciones").reset();

  cargarMisSolicitudesVacaciones();
}

async function cargarMisSolicitudesVacaciones() {
  const lista = document.getElementById("listaVacaciones");
  if (!lista) return;

  const { data, error } = await db
    .from("solicitudes_vacaciones")
    .select("*")
    .eq("usuario_id", colaboradorActual.id)
    .order("creado_en", { ascending: false });

  if (error) {
    lista.innerHTML = "<p>Error al cargar solicitudes.</p>";
    console.log("Error mis vacaciones:", error);
    return;
  }

  if (data.length === 0) {
    lista.innerHTML = "<p>No tiene solicitudes registradas.</p>";
    return;
  }

  lista.innerHTML = "";

  data.forEach(function (solicitud) {
    const div = document.createElement("div");
    div.classList.add("tarea");

    div.innerHTML = `
      <h3>Solicitud de vacaciones</h3>
      <p><strong>Desde:</strong> ${solicitud.fecha_inicio}</p>
      <p><strong>Hasta:</strong> ${solicitud.fecha_fin}</p>
      <p><strong>Días:</strong> ${solicitud.cantidad_dias}</p>
      <p><strong>Motivo:</strong> ${solicitud.motivo || "Sin motivo"}</p>
      <p class="estado"><strong>Estado:</strong> ${solicitud.estado}</p>
      <p><strong>Respuesta:</strong> ${solicitud.respuesta_admin || "Sin respuesta aún"}</p>
    `;

    lista.appendChild(div);
  });
}

async function cargarSolicitudesAdmin() {
  const contenedor = document.getElementById("solicitudesAdmin");
  if (!contenedor) return;

  const { data, error } = await db
    .from("solicitudes_vacaciones")
    .select(`
      *,
      usuarios (
        nombre,
        id_empleado,
        dias_vacaciones
      )
    `)
    .order("creado_en", { ascending: false });

  if (error) {
    contenedor.innerHTML = "<p>Error al cargar solicitudes.</p>";
    console.log("Error solicitudes admin:", error);
    return;
  }

  if (data.length === 0) {
    contenedor.innerHTML = "<p>No hay solicitudes de vacaciones.</p>";
    return;
  }

  contenedor.innerHTML = "";

  data.forEach(function (solicitud) {
    const div = document.createElement("div");
    div.classList.add("tarea");

    let botones = "";

    if (solicitud.estado === "pendiente") {
      botones = `
        <button onclick="responderVacaciones('${solicitud.id}', '${solicitud.usuario_id}', ${solicitud.cantidad_dias}, 'aprobada')">
          Aprobar
        </button>

        <button onclick="responderVacaciones('${solicitud.id}', '${solicitud.usuario_id}', ${solicitud.cantidad_dias}, 'rechazada')">
          Rechazar
        </button>
      `;
    }

    div.innerHTML = `
      <h3>${solicitud.usuarios.nombre}</h3>
      <p><strong>ID empleado:</strong> ${solicitud.usuarios.id_empleado}</p>
      <p><strong>Días disponibles:</strong> ${solicitud.usuarios.dias_vacaciones}</p>
      <p><strong>Desde:</strong> ${solicitud.fecha_inicio}</p>
      <p><strong>Hasta:</strong> ${solicitud.fecha_fin}</p>
      <p><strong>Días solicitados:</strong> ${solicitud.cantidad_dias}</p>
      <p><strong>Motivo:</strong> ${solicitud.motivo || "Sin motivo"}</p>
      <p class="estado"><strong>Estado:</strong> ${solicitud.estado}</p>
      <p><strong>Respuesta:</strong> ${solicitud.respuesta_admin || "Sin respuesta aún"}</p>
      ${botones}
    `;

    contenedor.appendChild(div);
  });
}

async function responderVacaciones(solicitudId, usuarioId, cantidadDias, estado) {
  let respuesta = estado === "aprobada"
    ? "Solicitud aprobada por administración."
    : "Solicitud rechazada por administración.";

  if (estado === "aprobada") {
    const { data: usuario, error: errorUsuario } = await db
      .from("usuarios")
      .select("dias_vacaciones")
      .eq("id", usuarioId)
      .single();

    if (errorUsuario) {
      alert("No se pudieron consultar los días del usuario.");
      console.log(errorUsuario);
      return;
    }

    if (usuario.dias_vacaciones < cantidadDias) {
      alert("El usuario no tiene suficientes días disponibles.");
      return;
    }

    const nuevosDias = usuario.dias_vacaciones - cantidadDias;

    const { error: errorActualizarDias } = await db
      .from("usuarios")
      .update({ dias_vacaciones: nuevosDias })
      .eq("id", usuarioId);

    if (errorActualizarDias) {
      alert("No se pudieron rebajar los días.");
      console.log(errorActualizarDias);
      return;
    }
  }

  const { error } = await db
    .from("solicitudes_vacaciones")
    .update({
      estado: estado,
      respuesta_admin: respuesta
    })
    .eq("id", solicitudId);

  if (error) {
    alert("Error al actualizar la solicitud.");
    console.log("Error responder vacaciones:", error);
    return;
  }

  alert("Solicitud actualizada correctamente.");
  cargarSolicitudesAdmin();
  cargarColaboradoresAdmin();
}

async function cargarMarcasAdmin() {
  const usuarioId = document.getElementById("selectMarcasColaborador").value;
  const tabla = document.getElementById("tablaMarcasAdmin");

  if (!usuarioId) {
    tabla.innerHTML = `<tr><td colspan="2">Seleccione un colaborador.</td></tr>`;
    return;
  }

  const { data, error } = await db
    .from("marcas")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("fecha_hora", { ascending: false });

  if (error) {
    tabla.innerHTML = `<tr><td colspan="2">Error al cargar marcas.</td></tr>`;
    console.log("Error marcas admin:", error);
    return;
  }

  if (data.length === 0) {
    tabla.innerHTML = `<tr><td colspan="2">Este colaborador no tiene marcas.</td></tr>`;
    return;
  }

  tabla.innerHTML = "";

  data.forEach(function (marca) {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${new Date(marca.fecha_hora).toLocaleString()}</td>
      <td>${formatearTipoMarca(marca.tipo)}</td>
    `;

    tabla.appendChild(fila);
  });
}

async function cargarTareasFinalizadasAdmin() {
  const contenedor = document.getElementById("tareasFinalizadasAdmin");
  if (!contenedor) return;

  const { data, error } = await db
    .from("tareas")
    .select(`
      *,
      usuarios (
        nombre,
        id_empleado
      )
    `)
    .eq("estado", "completada")
    .order("creado_en", { ascending: false });

  if (error) {
    contenedor.innerHTML = "<p>Error al cargar tareas finalizadas.</p>";
    console.log("Error tareas finalizadas:", error);
    return;
  }

  if (data.length === 0) {
    contenedor.innerHTML = "<p>No hay tareas finalizadas.</p>";
    return;
  }

  contenedor.innerHTML = "";

  data.forEach(function (tarea) {
    const div = document.createElement("div");
    div.classList.add("tarea");

    div.innerHTML = `
      <h3>${tarea.titulo}</h3>
      <p><strong>Colaborador:</strong> ${tarea.usuarios.nombre}</p>
      <p><strong>ID empleado:</strong> ${tarea.usuarios.id_empleado}</p>
      <p>${tarea.descripcion}</p>
      <p><strong>Fecha límite:</strong> ${tarea.fecha_limite || "Sin fecha"}</p>
      <p class="estado">Estado: ${tarea.estado}</p>
    `;

    contenedor.appendChild(div);
  });
}

function formatearTipoMarca(tipo) {
  if (tipo === "entrada") return "Entrada";
  if (tipo === "inicio_almuerzo") return "Inicio de almuerzo";
  if (tipo === "fin_almuerzo") return "Fin de almuerzo";
  if (tipo === "salida") return "Salida";
  return tipo;
}