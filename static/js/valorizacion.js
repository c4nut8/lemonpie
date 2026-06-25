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

async function cargarResumenValorizacion() {
    const data = await obtenerDatos("/api/resumen");

    document.getElementById("valor_total_sis").textContent =
        formatoMoneda(data.valor_total_sis);

    document.getElementById("valor_promedio_por_atencion").textContent =
        formatoMoneda(data.valor_promedio_por_atencion);

    document.getElementById("atenciones_valorizadas").textContent =
        formatoNumero(data.atenciones_valorizadas);

    document.getElementById("atenciones_sin_valorizacion").textContent =
        formatoNumero(data.atenciones_sin_valorizacion);
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
                tension: 0.3,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

async function crearGraficoEstadoValorizacion() {
    const data = await obtenerDatos("/api/estado-valorizacion");

    new Chart(document.getElementById("chartEstadoValorizacion"), {
        type: "doughnut",
        data: {
            labels: data.map(item => item.estado_valorizacion),
            datasets: [{
                data: data.map(item => item.total_atenciones),
                backgroundColor: ["#2fb344", "#f59f00", "#d63939", "#868e96"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

async function crearGraficoObservados() {
    const data = await obtenerDatos("/api/observados");

    new Chart(document.getElementById("chartObservados"), {
        type: "bar",
        data: {
            labels: data.map(item => item.estado_observacion),
            datasets: [{
                label: "Atenciones",
                data: data.map(item => item.total_atenciones),
                backgroundColor: "#ae3ec9"
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

async function crearGraficoComponentesValorizacion() {
    const data = await obtenerDatos("/api/componentes-valorizacion");

    new Chart(document.getElementById("chartComponentesValorizacion"), {
        type: "bar",
        data: {
            labels: ["Servicios", "Medicamentos", "Insumos", "Procedimientos"],
            datasets: [{
                label: "Monto SIS",
                data: [
                    data.total_servicios,
                    data.total_medicamentos,
                    data.total_insumos,
                    data.total_procedimientos
                ],
                backgroundColor: ["#206bc4", "#2fb344", "#f76707", "#ae3ec9"]
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

async function cargarTablaComponentesValorizacion() {
    const data = await obtenerDatos("/api/componentes-valorizacion");
    const tbody = document.getElementById("tablaComponentesValorizacion");

    const componentes = [
        ["Servicios", data.total_servicios],
        ["Medicamentos", data.total_medicamentos],
        ["Insumos", data.total_insumos],
        ["Procedimientos", data.total_procedimientos]
    ];

    tbody.innerHTML = "";

    componentes.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item[0]}</td>
                <td class="text-end">${formatoMoneda(item[1])}</td>
            </tr>
        `;
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await cargarResumenValorizacion();
        await crearGraficoValorizacionMes();
        await crearGraficoEstadoValorizacion();
        await crearGraficoObservados();
        await crearGraficoComponentesValorizacion();
        await cargarTablaComponentesValorizacion();
    } catch (error) {
        console.error(error);
        alert("Error al cargar la página de valorización: " + error.message);
    }
});