import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// CONFIGURACIÓN DE SUPABASE
const supabaseUrl = "https://tsvcfyizphlkovewphiu.supabase.co";
const supabaseKey = "sb_publishable_il_CHGqRmd7mgqWrbvC_xg_7e_IfRV-"; 
const supabase = createClient(supabaseUrl, supabaseKey);

// =========================
// VERIFICAR SESIÓN
// =========================
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

// =========================
// LOGIN
// =========================
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

    alert("Bienvenido ✅");

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").style.display = "block";

    cargarColaboradores();
    cargarReporte();
}

// =========================
// LOGOUT
// =========================
async function logout() {
    await supabase.auth.signOut();
    location.reload();
}

// =========================
// GUARDAR COLABORADOR
// =========================
async function guardarColaborador() {
    const id = document.getElementById("colabId").value;
    const nombre = document.getElementById("colabNombre").value;
    const fecha = document.getElementById("colabFecha").value;

    if (!id || !nombre || !fecha) {
        alert("Complete todos los campos");
        return;
    }

    const { error } = await supabase
        .from("colaboradores")
        .insert([{ id, nombre, fecha_ingreso: fecha }]);

    if (error) {
        alert("Error al guardar");
        console.log(error);
    } else {
        alert("Guardado ✅");
        cargarColaboradores();
        cargarReporte();
    }
}

// =========================
// CARGAR COLABORADORES
// =========================
async function cargarColaboradores() {
    const { data, error } = await supabase
        .from("colaboradores")
        .select("*");

    if (error) {
        console.log(error);
        return;
    }

    const select = document.getElementById("selectColab");
    select.innerHTML = "<option value=''>Seleccione</option>";

    data.forEach(c => {
        let op = document.createElement("option");
        op.value = c.id;
        op.textContent = c.nombre;
        select.appendChild(op);
    });
}

// =========================
// GUARDAR MARCA AUTOMÁTICA
// =========================
async function guardarMarcaAuto() {

    const colab = document.getElementById("selectColab").value;

    if (!colab) {
        alert("Seleccione un colaborador");
        return;
    }

    let ahora = new Date();
    let fecha = ahora.toISOString().split("T")[0];
    let hora = ahora.toTimeString().slice(0,5);

    const { data: ultimas, error } = await supabase
        .from("marcas")
        .select("*")
        .eq("colab_id", colab)
        .order("fecha", { ascending: false })
        .limit(1);

    if (error) {
        console.log(error);
        return;
    }

    let ultima = ultimas[0];

    if (ultima && !ultima.salida) {

        const { error: updateError } = await supabase
            .from("marcas")
            .update({ salida: hora })
            .eq("id", ultima.id);

        if (!updateError) {
            alert("Salida registrada automáticamente ✅");
        }

    } else {

        const { error: insertError } = await supabase
            .from("marcas")
            .insert([{
                fecha: fecha,
                entrada: hora,
                colab_id: colab
            }]);

        if (!insertError) {
            alert("Entrada registrada automáticamente ✅");
        }
    }

    cargarReporte();
}

// =========================
// REPORTE
// =========================
async function cargarReporte() {
    const { data: colabs } = await supabase.from("colaboradores").select("*");
    const { data: marcas } = await supabase.from("marcas").select("*");

    let html = "<h3>Colaboradores</h3>";

    colabs.forEach(c => {
        html += `<p>${c.id} - ${c.nombre}</p>`;
    });

    html += "<h3>Marcas</h3>";

    marcas.forEach(m => {
        html += `<p>${m.fecha} | ${m.entrada || "-"} - ${m.salida || "-"}</p>`;
    });

    document.getElementById("reporte").innerHTML = html;
}

// =========================
// CARGA INICIAL
// =========================
window.onload = async function () {
    await verificarSesion();
};

// =========================
// FUNCIONES PARA HTML
// =========================
window.login = login;
window.logout = logout;
window.guardarColaborador = guardarColaborador;
window.guardarMarcaAuto = guardarMarcaAuto;
window.cargarReporte = cargarReporte;

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnLogin");
    if (btn) {
        btn.addEventListener("click", login);
    }
});