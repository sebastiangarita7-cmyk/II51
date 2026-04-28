import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// ==========================================
// CONFIGURACIÓN DE SUPABASE
// Aquí se conecta el sistema con la base de datos
// usando la URL del proyecto y la clave pública
// ==========================================
const supabaseUrl = "https://tsvcfyizphlkovewphiu.supabase.co";
const supabaseKey = "sb_publishable_il_CHGqRmd7mgqWrbvC_xg_7e_IfRV-";
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// VERIFICAR SESIÓN
// Esta función revisa si ya hay una sesión iniciada.
// Si sí hay sesión, muestra la app.
// Si no hay sesión, muestra el login.
// ==========================================
async function verificarSesion() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("app").style.display = "block";

        cargarColaboradores();
        cargarReporte();
    } else {
        document.getElementById("loginBox").style.display = "block";
        document.getElementById("app").style.display = "none";
    }
}

// ==========================================
// LOGIN
// Esta función toma el correo y contraseña
// escritos por el usuario e intenta iniciar sesión
// en Supabase.
// ==========================================
async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Ingrese correo y contraseña");
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert("Credenciales incorrectas");
        console.log("Error login:", error);
        return;
    }
    alert("Bienvenido ");

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").style.display = "block";

    cargarColaboradores();
    cargarReporte();
}

// ==========================================
// LOGOUT
// Esta función cierra la sesión actual
// y recarga la página para volver al login.
// ==========================================
async function logout() {
    await supabase.auth.signOut();
    location.reload();
}

// ==========================================
// GUARDAR COLABORADOR
// Esta función toma los datos del formulario
// y guarda un nuevo colaborador en la tabla.
// ==========================================
async function guardarColaborador() {
    const id = document.getElementById("colabId").value;
    const nombre = document.getElementById("colabNombre").value;
    const fecha = document.getElementById("colabFecha").value;
    const area = document.getElementById("colabArea").value;
    const turno = document.getElementById("colabTurno").value;

    if (!id || !nombre || !fecha || !area || !turno) {
        alert("Complete todos los campos");
        return;
    }

    const { error } = await supabase
        .from("colaboradores")
        .insert([{
            id: id,
            nombre: nombre,
            fecha_ingreso: fecha,
            area: area,
            turno: turno
        }]);

    if (error) {
        alert("Error al guardar colaborador");
        console.log("Error colaborador:", error);
    } else {
        alert("Colaborador guardado correctamente ");

        document.getElementById("colabId").value = "";
        document.getElementById("colabNombre").value = "";
        document.getElementById("colabFecha").value = "";
        document.getElementById("colabArea").value = "";
        document.getElementById("colabTurno").value = "";

        cargarColaboradores();
        cargarReporte();
    }
}

// ==========================================
// CARGAR COLABORADORES
// Esta función consulta la tabla colaboradores
// y llena el select para escoger un colaborador
// al momento de guardar una marca.
// ==========================================
async function cargarColaboradores() {
    const { data, error } = await supabase
        .from("colaboradores")
        .select("*");

    if (error) {
        console.log("Error al cargar colaboradores:", error);
        return;
    }

    const select = document.getElementById("selectColab");
    select.innerHTML = "<option value=''>Seleccione colaborador</option>";

    data.forEach(c => {
        let op = document.createElement("option");
        op.value = c.id;
        op.textContent = `${c.nombre} - ${c.area} - ${c.turno}`;
        select.appendChild(op);
    });
}

// ==========================================
// GUARDAR MARCA MANUAL
// Esta función guarda la marca con los datos
// escritos manualmente: fecha, hora de entrada,
// hora de salida, colaborador y tipo de marca.
// ==========================================
async function guardarMarcaManual() {
    const colab = document.getElementById("selectColab").value;
    const tipo = document.getElementById("tipoMarca").value;
    const fecha = document.getElementById("marcaFecha").value;
    const entrada = document.getElementById("marcaEntrada").value;
    const salida = document.getElementById("marcaSalida").value;

    if (!colab || !tipo || !fecha || !entrada || !salida) {
        alert("Complete todos los campos de marca");
        return;
    }

    const { error } = await supabase
        .from("marcas")
        .insert([{
            fecha: fecha,
            entrada: entrada,
            salida: salida,
            colab_id: colab,
            tipo: tipo
        }]);

    if (error) {
        alert("Error al guardar la marca");
        console.log("Error marca:", error);
    } else {
        alert("Marca guardada correctamente ✅");

        document.getElementById("selectColab").value = "";
        document.getElementById("tipoMarca").value = "";
        document.getElementById("marcaFecha").value = "";
        document.getElementById("marcaEntrada").value = "";
        document.getElementById("marcaSalida").value = "";

        cargarReporte();
    }
}

// ==========================================
// CARGAR REPORTE
// Esta función consulta los colaboradores y las marcas
// y los muestra en pantalla dentro del div reporte.
// ==========================================
async function cargarReporte() {
    const { data: colabs, error: errorColabs } = await supabase
        .from("colaboradores")
        .select("*");

    const { data: marcas, error: errorMarcas } = await supabase
        .from("marcas")
        .select("*");

    if (errorColabs) {
        console.log("Error al cargar colaboradores del reporte:", errorColabs);
        return;
    }

    if (errorMarcas) {
        console.log("Error al cargar marcas del reporte:", errorMarcas);
        return;
    }

    let html = "<h3>Colaboradores</h3>";

    colabs.forEach(c => {
        html += `<p><strong>ID:</strong> ${c.id} | <strong>Nombre:</strong> ${c.nombre} | <strong>Área:</strong> ${c.area} | <strong>Turno:</strong> ${c.turno} | <strong>Ingreso:</strong> ${c.fecha_ingreso}</p>`;
    });

    html += "<h3>Marcas</h3>";

    marcas.forEach(m => {
        html += `<p><strong>Fecha:</strong> ${m.fecha} | <strong>Entrada:</strong> ${m.entrada} | <strong>Salida:</strong> ${m.salida} | <strong>Tipo:</strong> ${m.tipo} | <strong>Colaborador ID:</strong> ${m.colab_id}</p>`;
    });

    document.getElementById("reporte").innerHTML = html;
}

// ==========================================
// CARGA INICIAL
// Apenas abre la página, se revisa si ya hay sesión
// iniciada para decidir si se muestra el login o la app.
// ==========================================
window.onload = async function () {
    await verificarSesion();
};

// ==========================================
// ENLACE DE FUNCIONES CON EL HTML
// Esto permite llamar las funciones desde botones
// que están en el HTML.
// ==========================================
window.login = login;
window.logout = logout;
window.guardarColaborador = guardarColaborador;
window.guardarMarcaManual = guardarMarcaManual;
window.cargarReporte = cargarReporte;

// ==========================================
// EVENTO DEL BOTÓN LOGIN
// Aquí se enlaza el botón de ingresar con la función login.
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnLogin");
    if (btn) {
        btn.addEventListener("click", login);
    }
});