// Standalone login function for Proyecto (Supabase "usuarios" table)
// Can be used independently or imported

const supabaseUrl = 'https://vdimnldttlxudqswbjzn.supabase.co';
const supabaseKey = 'your-anon-key-here'; // Replace with actual anon key

const { createClient } = supabase; // Assumes supabase-js CDN loaded
const supabase = createClient(supabaseUrl, supabaseKey);

async function loginCedula() {
    const cedulaEl = document.getElementById("cedula");
    const mensajeEl = document.getElementById("mensaje");
    
    if (!cedulaEl || !mensajeEl) {
        console.error("DOM elements #cedula or #mensaje not found");
        return;
    }

    const cedula = cedulaEl.value.trim();

    if (!cedula) {
        mensajeEl.innerText = "Ingrese una cédula";
        mensajeEl.className = "status-error"; // Assume CSS class
        return;
    }

    mensajeEl.innerText = "Buscando...";
    mensajeEl.className = "status-muted";

    try {
        const { data, error } = await supabase
            .from("usuarios")
            .select("*")
            .eq("cedula", cedula)
            .single();

        if (error) throw error;

        if (data) {
            localStorage.setItem("usuario", JSON.stringify(data));
            window.location.href = "dashboard.html";
        } else {
            mensajeEl.innerText = "Cédula no encontrada";
            mensajeEl.className = "status-error";
        }
    } catch (error) {
        console.error("Login error:", error);
        mensajeEl.innerText = "Error de servidor. Revisa consola.";
        mensajeEl.className = "status-error";
    }
}

// Auto-check session on load
document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario) {
        window.location.href = "dashboard.html";
    }
});
