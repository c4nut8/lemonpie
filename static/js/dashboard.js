function formatoNumero(valor) {
    return Number(valor || 0).toLocaleString("es-PE");
}

function formatoMoneda(valor) {
    return "S/ " + Number(valor || 0).toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

async function obtenerDatos(url) {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        throw new Error(data.error);
    }

    return data;
}

async function cargarResumenGeneral() {
    const data = await obtenerDatos("/api/resumen");

    document.getElementById("total_atenciones").textContent =
        formatoNumero(data.total_atenciones);

    document.getElementById("pacientes_unicos").textContent =
        formatoNumero(data.pacientes_unicos);

    document.getElementById("atenciones_valorizadas").textContent =
        formatoNumero(data.atenciones_valorizadas);

    document.getElementById("atenciones_sin_valorizacion").textContent =
        formatoNumero(data.atenciones_sin_valorizacion);

    document.getElementById("porcentaje_valorizacion").textContent =
        Number(data.porcentaje_valorizacion || 0).toFixed(2) + "%";

    document.getElementById("valor_total_sis").textContent =
        formatoMoneda(data.valor_total_sis);

    document.getElementById("valor_promedio_por_atencion").textContent =
        formatoMoneda(data.valor_promedio_por_atencion);

    const barra = document.getElementById("barra_porcentaje_valorizacion");
    if (barra) {
        barra.style.width = Number(data.porcentaje_valorizacion || 0) + "%";
    }
}

async function crearGraficoAtencionesMes() {
    const data = await obtenerDatos("/api/atenciones-mes");

    new Chart(document.getElementById("chartAtencionesMes"), {
        type: "bar",
        data: {
            labels: data.map(item => item.periodo_atencion),
            datasets: [{
                label: "Atenciones",
                data: data.map(item => item.total_atenciones),
                backgroundColor: "#206bc4"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

async function crearGraficoValorizacionMes() {
    const data = await obtenerDatos("/api/valorizacion-mes");

    new Chart(document.getElementById("chartValorizacionMes"), {
        type: "line",
        data: {
            labels: data.map(item => item.periodo_atencion),
            datasets: [{
                label: "Valor SIS",
                data: data.map(item => item.total_valorizado_sis),
                borderColor: "#2fb344",
                backgroundColor: "#2fb344",
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await cargarResumenGeneral();
        await crearGraficoAtencionesMes();
        await crearGraficoValorizacionMes();
    } catch (error) {
        console.error(error);
        alert("Error al cargar el dashboard: " + error.message);
    }
});