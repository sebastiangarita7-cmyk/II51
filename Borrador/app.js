import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = "https://tsvcfyizphlkovewphiu.supabase.co"
const supabaseKey = "sb_publishable_il_CHGqRmd7mgqWrbvC_xg_7e_IfRV-"

const supabase = createClient(supabaseUrl, supabaseKey)

// ======================
//  LOGIN
// ======================
window.login = async () => {

    let correo = document.getElementById("correo").value
    let password = document.getElementById("password").value

    const { data, error } = await supabase.auth.signInWithPassword({
        email: correo,
        password: password
    });

    if (error) {
        alert("Correo o contraseña incorrectos")
        console.error(error)
        return
    }

    // Obtener datos del usuario (rol)
    const { data: userData, error: err2 } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", data.user.id)
        .single()

    if (err2) {
        console.error(err2)
        alert("Error cargando usuario")
        return
    }

    localStorage.setItem("user", JSON.stringify(userData))

    window.location.href = "dashboard.html"
}

// ======================
//  REGISTRO
// ======================
window.registrar = async () => {

    let nombre = document.getElementById("nombre").value
    let apellidos = document.getElementById("apellidos").value
    let correo = document.getElementById("correo").value
    let password = document.getElementById("password").value
    let rol = document.getElementById("rol").value

    // 1. Crear usuario en Auth
    const { data, error } = await supabase.auth.signUp({
        email: correo,
        password: password
    });

    if (error) {
        alert("Error al registrar: " + error.message)
        console.error(error)
        return
    }

    // 2. Guardar datos adicionales
    const { error: err2 } = await supabase.from("usuarios").insert([{
        id: data.user.id,
        nombre,
        apellidos,
        correo,
        rol
    }])

    if (err2) {
        alert("Error guardando usuario")
        console.error(err2)
        return
    }

    alert("Usuario creado correctamente")
    window.location.href = "index.html"
}

// ======================
//  EMPLEADOS
// ======================
window.agregarEmpleado = async () => {

    let nombre = document.getElementById("nombre").value
    let puesto = document.getElementById("puesto").value
    let area = document.getElementById("area").value

    const { error } = await supabase
        .from("empleados")
        .insert([{ nombre, puesto, area }])

    if (error) {
        alert("Error al agregar empleado")
        console.error(error)
        return
    }

    alert("Empleado agregado")
}

// ======================
//  ASISTENCIA
// ======================
window.registrarAsistencia = async () => {

    let empleado_id = document.getElementById("empleado").value
    let fecha = document.getElementById("fecha").value
    let entrada = document.getElementById("entrada").value
    let salida = document.getElementById("salida").value

    const { error } = await supabase.from("asistencia").insert([
        {
            empleado_id,
            fecha,
            hora_entrada: entrada,
            hora_salida: salida
        }
    ])

    if (error) {
        alert("Error al guardar asistencia")
        console.error(error)
        return
    }

    alert("Asistencia guardada")
}

// ======================
//  FILTRO POR FECHA
// ======================
window.filtrarAsistencia = async () => {

    let inicio = document.getElementById("fechaInicio").value
    let fin = document.getElementById("fechaFin").value

    const { data, error } = await supabase
        .from("asistencia")
        .select(`
            fecha,
            hora_entrada,
            hora_salida,
            empleados (nombre)
        `)
        .gte("fecha", inicio)
        .lte("fecha", fin)
        .order("fecha", { ascending: true })

    if (error) {
        alert("Error al filtrar")
        console.error(error)
        return
    }

    let tabla = document.getElementById("tabla")
    tabla.innerHTML = ""

    data.forEach(reg => {
        tabla.innerHTML += `
            <tr>
                <td>${reg.empleados.nombre}</td>
                <td>${reg.fecha}</td>
                <td>${reg.hora_entrada || "-"}</td>
                <td>${reg.hora_salida || "-"}</td>
            </tr>
        `
    })
}

// ======================
//  CONTROL DE SESIÓN
// ======================
window.verificarSesion = async () => {

    const { data } = await supabase.auth.getUser()

    if (!data.user) {
        window.location.href = "index.html"
    }
}

// ======================
//  CONTROL DE ROLES
// ======================
window.verificarRol = () => {

    let user = JSON.parse(localStorage.getItem("user"))

    if (!user) return

    if (user.rol !== "admin") {
        let adminPanel = document.getElementById("adminPanel")
        if (adminPanel) adminPanel.style.display = "none"
    }
}

// ======================
//  LOGOUT
// ======================
window.logout = async () => {

    await supabase.auth.signOut()

    localStorage.removeItem("user")
    window.location.href = "index.html"
}