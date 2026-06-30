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

function valorSeguro(objeto, posiblesCampos) {
    for (const campo of posiblesCampos) {
        if (objeto[campo] !== undefined && objeto[campo] !== null) {
            return objeto[campo];
        }
    }
    return 0;
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

async function crearGraficoSexo() {
    const data = await obtenerDatos("/api/sexo");

    new Chart(document.getElementById("chartSexo"), {
        type: "doughnut",
        data: {
            labels: data.map(item => item.sexo),
            datasets: [{
                data: data.map(item => item.total_atenciones),
                backgroundColor: ["#206bc4", "#d6336c", "#868e96"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

async function crearGraficoEstablecimientos() {
    const data = await obtenerDatos("/api/establecimientos");

    new Chart(document.getElementById("chartEstablecimientos"), {
        type: "bar",
        data: {
            labels: data.map(item => item.establecimiento),
            datasets: [{
                label: "Atenciones",
                data: data.map(item => item.total_atenciones),
                backgroundColor: "#f76707"
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

async function crearGraficoServicios() {
    const data = await obtenerDatos("/api/servicios");

    new Chart(document.getElementById("chartServicios"), {
        type: "bar",
        data: {
            labels: data.map(item => item.servicio),
            datasets: [{
                label: "Atenciones",
                data: data.map(item => item.total_atenciones),
                backgroundColor: "#4299e1"
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

async function cargarTablaEstablecimientos() {
    const data = await obtenerDatos("/api/establecimientos");
    const tbody = document.getElementById("tablaEstablecimientos");

    tbody.innerHTML = "";

    data.forEach((item, index) => {
        const establecimiento = item.establecimiento || "No especificado";
        const totalAtenciones = valorSeguro(item, ["total_atenciones", "atenciones"]);
        const valorSis = valorSeguro(item, ["total_valorizado_sis", "valor_total_sis", "valor_sis"]);

        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${establecimiento}</td>
                <td class="text-end">${formatoNumero(totalAtenciones)}</td>
                <td class="text-end">${formatoMoneda(valorSis)}</td>
            </tr>
        `;
    });
}

async function cargarTablaServicios() {
    const data = await obtenerDatos("/api/servicios");
    const tbody = document.getElementById("tablaServicios");

    tbody.innerHTML = "";

    data.forEach((item, index) => {
        const servicio = item.servicio || "No especificado";
        const totalAtenciones = valorSeguro(item, ["total_atenciones", "atenciones"]);
        const valorSis = valorSeguro(item, ["total_valorizado_sis", "valor_total_sis", "valor_sis"]);

        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${servicio}</td>
                <td class="text-end">${formatoNumero(totalAtenciones)}</td>
                <td class="text-end">${formatoMoneda(valorSis)}</td>
            </tr>
        `;
    });
}

let chartServicioTiempo = null;

async function cargarListaServicios() {
    const data = await obtenerDatos("/api/lista-servicios");
    const select = document.getElementById("filtroServicio");

    data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.servicio;
        option.textContent = item.servicio;
        select.appendChild(option);
    });
}

async function crearGraficoServicioTiempo() {
    const servicio = document.getElementById("filtroServicio").value;
    const granularidad = document.getElementById("filtroGranularidad").value;

    const url = `/api/atenciones-servicio-tiempo?servicio=${encodeURIComponent(servicio)}&granularidad=${granularidad}`;

    const data = await obtenerDatos(url);

    const ctx = document.getElementById("chartServicioTiempo");

    if (chartServicioTiempo) {
        chartServicioTiempo.destroy();
    }

    chartServicioTiempo = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.map(item => item.periodo),
            datasets: [{
                label: servicio === "TODOS" ? "Todos los servicios" : servicio,
                data: data.map(item => item.total_atenciones),
                borderColor: "#17365D",
                backgroundColor: "#17365D",
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

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await cargarListaServicios();
        await crearGraficoServicioTiempo();

        document.getElementById("btnAplicarFiltros").addEventListener("click", async () => {
            await crearGraficoServicioTiempo();
        });

        await crearGraficoAtencionesMes();
        await crearGraficoSexo();
        await crearGraficoEstablecimientos();
        await crearGraficoServicios();
        await cargarTablaEstablecimientos();
        await cargarTablaServicios();
    } catch (error) {
        console.error(error);
        alert("Error al cargar la página de atenciones: " + error.message);
    }
});