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

let serviciosDisponibles = [];
let graficoServicioTiempo = null;

async function cargarListaServicios() {
    const data = await obtenerDatos("/api/lista-servicios");

    serviciosDisponibles = data;

    const datalist = document.getElementById("listaServicios");
    datalist.innerHTML = "";

    data.forEach(item => {
        const option = document.createElement("option");
        option.value = `${item.cod_servicio} - ${item.descripcion_servicio}`;
        datalist.appendChild(option);
    });
}
function obtenerServicioSeleccionado() {
    const textoBuscado = document.getElementById("buscadorServicio").value.trim().toLowerCase();
    const inputHidden = document.getElementById("filtroServicio");

    if (
        textoBuscado === "" ||
        textoBuscado === "todos" ||
        textoBuscado === "todos los servicios"
    ) {
        inputHidden.value = "TODOS";
        return {
            codigo: "TODOS",
            texto: "Todos los servicios"
        };
    }

    const servicioEncontrado = serviciosDisponibles.find(item => {
        const codigo = String(item.cod_servicio || "").toLowerCase();
        const descripcion = String(item.descripcion_servicio || "").toLowerCase();
        const label = String(item.servicio_label || "").toLowerCase();

        return (
            label === textoBuscado ||
            codigo === textoBuscado ||
            descripcion === textoBuscado ||
            label.includes(textoBuscado)
        );
    });

    if (servicioEncontrado) {
        inputHidden.value = servicioEncontrado.cod_servicio;

        return {
            codigo: servicioEncontrado.cod_servicio,
            texto: servicioEncontrado.servicio_label
        };
    }

    inputHidden.value = "TODOS";

    return {
        codigo: "TODOS",
        texto: "Todos los servicios"
    };
}

async function crearGraficoServicioTiempo() {
    const servicioSeleccionado = obtenerServicioSeleccionado();

    const servicio = servicioSeleccionado.codigo;
    const servicioTexto = servicioSeleccionado.texto;

    const granularidad = document.getElementById("filtroGranularidad").value;
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;

    const params = new URLSearchParams();

    params.append("servicio", servicio);
    params.append("granularidad", granularidad);

    if (fechaInicio) {
        params.append("fecha_inicio", fechaInicio);
    }

    if (fechaFin) {
        params.append("fecha_fin", fechaFin);
    }

    const url = `/api/atenciones-servicio-tiempo?${params.toString()}`;

    console.log("URL filtro:", url);

    const data = await obtenerDatos(url);

    console.log("Datos recibidos:", data);

    const ctx = document.getElementById("chartServicioTiempo");

    if (graficoServicioTiempo instanceof Chart) {
        graficoServicioTiempo.destroy();
    }

    graficoServicioTiempo = new Chart(ctx, {
        type: granularidad === "dia" ? "line" : "bar",
        data: {
            labels: data.map(item => item.periodo),
            datasets: [{
                label: servicio === "TODOS" ? "Todos los servicios" : servicioTexto,
                data: data.map(item => item.total_atenciones),
                borderColor: "#17365D",
                backgroundColor: "#5E86B5",
                tension: 0.3,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        document.getElementById("fechaInicio").value = "2025-01-01";
        document.getElementById("fechaFin").value = "2025-12-31";

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