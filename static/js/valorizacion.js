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

async function crearGraficoValorizacionMes(fechaInicio = null, fechaFin = null) {
    let data = await obtenerDatos("/api/valorizacion-mes");

    if (fechaInicio || fechaFin) {
        data = data.filter(item => {
            const periodo = String(item.periodo_atencion || item.periodo || "");
            const periodoDate = parsePeriodoFecha(periodo);

            if (!periodoDate) {
                return false;
            }

            if (fechaInicio) {
                const inicio = new Date(fechaInicio + "T00:00:00");
                if (periodoDate < inicio) {
                    return false;
                }
            }

            if (fechaFin) {
                const fin = new Date(fechaFin + "T23:59:59");
                if (periodoDate > fin) {
                    return false;
                }
            }

            return true;
        });
    }

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

function parsePeriodoFecha(periodo) {
    if (!periodo) {
        return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(periodo)) {
        return new Date(periodo + "T00:00:00");
    }

    if (/^\d{4}-\d{2}$/.test(periodo)) {
        return new Date(periodo + "-01T00:00:00");
    }

    return null;
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

async function cargarGraficosValorizacionAnteriores() {
    try {
        const fechaInicioInput = document.getElementById("fechaInicioValorizacion");
        const fechaFinInput = document.getElementById("fechaFinValorizacion");

        if (fechaInicioInput && fechaFinInput) {
            fechaInicioInput.value = "2025-01-01";
            fechaFinInput.value = "2025-12-31";
        }

        await cargarResumenValorizacion();
        await crearGraficoValorizacionMes(
            fechaInicioInput?.value,
            fechaFinInput?.value
        );
        await crearGraficoEstadoValorizacion();
        await crearGraficoObservados();
        await crearGraficoComponentesValorizacion();
        await cargarTablaComponentesValorizacion();

        const botonAplicar = document.getElementById("btnAplicarFiltrosValorizacion");
        if (botonAplicar) {
            botonAplicar.addEventListener("click", async () => {
                await crearGraficoValorizacionMes(
                    fechaInicioInput?.value,
                    fechaFinInput?.value
                );
            });
        }
    } catch (error) {
        console.error(error);
        alert("Error al cargar la página de valorización: " + error.message);
    }
}

let graficoValorizacionFiltrada = null;

function parametrosValorizacion() {
    const params = new URLSearchParams({
        tipo: document.getElementById("filtroTipoValorizacion").value,
        granularidad: document.getElementById("filtroGranularidadValorizacion").value
    });
    const inicio = document.getElementById("fechaInicioValorizacion").value;
    const fin = document.getElementById("fechaFinValorizacion").value;
    if (inicio) params.set("fecha_inicio", inicio);
    if (fin) params.set("fecha_fin", fin);
    return params;
}

function validarFechasValorizacion() {
    const inicio = document.getElementById("fechaInicioValorizacion").value;
    const fin = document.getElementById("fechaFinValorizacion").value;
    if (inicio && fin && inicio > fin) throw new Error("La fecha de inicio no puede ser posterior a la fecha final.");
}

async function cargarValorizacionFiltrada() {
    validarFechasValorizacion();
    const data = await obtenerDatos(`/api/valorizacion-filtrada?${parametrosValorizacion()}`);
    const tipoSelect = document.getElementById("filtroTipoValorizacion");
    const agrupacionSelect = document.getElementById("filtroGranularidadValorizacion");
    const tipoLabel = tipoSelect.options[tipoSelect.selectedIndex].text;
    const agrupacionLabel = agrupacionSelect.options[agrupacionSelect.selectedIndex].text;
    document.getElementById("resumenFiltroValorizacion").textContent = `${tipoLabel} · Agrupación: ${agrupacionLabel}`;

    if (graficoValorizacionFiltrada instanceof Chart) graficoValorizacionFiltrada.destroy();
    graficoValorizacionFiltrada = new Chart(document.getElementById("chartValorizacionFiltrada"), {
        type: agrupacionSelect.value === "dia" ? "line" : "bar",
        data: { labels: data.map(item => item.periodo), datasets: [{ label: tipoLabel, data: data.map(item => Number(item.monto_valorizado || 0)), borderColor: "#17365D", backgroundColor: "#5E86B5", tension: 0.3, fill: false }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    const tbody = document.getElementById("tablaValorizacionFiltrada");
    tbody.innerHTML = "";
    if (!data.length) tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay datos para los filtros seleccionados.</td></tr>';
    data.forEach(item => {
        const row = document.createElement("tr");
        [item.periodo, formatoNumero(item.total_atenciones), formatoNumero(item.atenciones_valorizadas), formatoMoneda(item.monto_valorizado), formatoMoneda(item.promedio_valorizado)].forEach((valor, index) => {
            const cell = document.createElement("td");
            if (index > 0) cell.className = "text-end";
            cell.textContent = valor;
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });

    const totalAtenciones = data.reduce((suma, item) => suma + Number(item.total_atenciones || 0), 0);
    const totalValorizadas = data.reduce((suma, item) => suma + Number(item.atenciones_valorizadas || 0), 0);
    const totalMonto = data.reduce((suma, item) => suma + Number(item.monto_valorizado || 0), 0);
    const promedio = totalValorizadas ? totalMonto / totalValorizadas : 0;
    document.getElementById("totalesValorizacionFiltrada").innerHTML = data.length ? `<tr class="fw-bold"><td>Total</td><td class="text-end">${formatoNumero(totalAtenciones)}</td><td class="text-end">${formatoNumero(totalValorizadas)}</td><td class="text-end">${formatoMoneda(totalMonto)}</td><td class="text-end">${formatoMoneda(promedio)}</td></tr>` : "";
    document.getElementById("cantidadResultadosValorizacion").textContent = `${data.length} ${data.length === 1 ? "periodo" : "periodos"}`;
}

function descargarValorizacionExcel() {
    try {
        validarFechasValorizacion();
        window.location.href = `/api/exportar-valorizacion-excel?${parametrosValorizacion()}`;
    } catch (error) { alert(error.message); }
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        document.getElementById("fechaInicioValorizacion").value = "2025-01-01";
        document.getElementById("fechaFinValorizacion").value = "2025-12-31";
        document.getElementById("btnAplicarFiltrosValorizacion").addEventListener("click", async () => {
            try { await cargarValorizacionFiltrada(); } catch (error) { alert(error.message); }
        });
        document.getElementById("btnDescargarValorizacion").addEventListener("click", descargarValorizacionExcel);
        await cargarResumenValorizacion();
        await cargarValorizacionFiltrada();
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
