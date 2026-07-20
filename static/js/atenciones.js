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

        const row = document.createElement("tr");
        const cells = [
            String(index + 1),
            establecimiento,
            formatoNumero(totalAtenciones),
            formatoMoneda(valorSis)
        ];

        cells.forEach((value, cellIndex) => {
            const cell = document.createElement("td");
            if (cellIndex === 2 || cellIndex === 3) {
                cell.className = "text-end";
            }
            cell.textContent = value;
            row.appendChild(cell);
        });

        tbody.appendChild(row);
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

        const row = document.createElement("tr");
        const cells = [
            String(index + 1),
            servicio,
            formatoNumero(totalAtenciones),
            formatoMoneda(valorSis)
        ];

        cells.forEach((value, cellIndex) => {
            const cell = document.createElement("td");
            if (cellIndex === 2 || cellIndex === 3) {
                cell.className = "text-end";
            }
            cell.textContent = value;
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}

let serviciosDisponibles = [];
let establecimientosDisponibles = [];
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

    throw new Error("Selecciona un servicio válido de la lista o usa “Todos los servicios”.");
}

async function cargarListaEstablecimientos() {
    establecimientosDisponibles = await obtenerDatos("/api/lista-establecimientos");
    const datalist = document.getElementById("listaEstablecimientos");
    datalist.innerHTML = "";
    establecimientosDisponibles.forEach(item => {
        const option = document.createElement("option");
        option.value = item.establecimiento_label;
        datalist.appendChild(option);
    });
}

function obtenerEstablecimientoSeleccionado() {
    const texto = document.getElementById("buscadorEstablecimiento").value.trim().toLowerCase();
    const inputHidden = document.getElementById("filtroEstablecimiento");
    if (!texto || texto === "todos" || texto === "todos los establecimientos") {
        inputHidden.value = "TODOS";
        return { codigo: "TODOS", texto: "Todos los establecimientos" };
    }
    const encontrado = establecimientosDisponibles.find(item => {
        const codigo = String(item.codigo_eess || "").toLowerCase();
        const nombre = String(item.nombre_eess || "").toLowerCase();
        const label = String(item.establecimiento_label || "").toLowerCase();
        return label === texto || codigo === texto || nombre === texto || label.includes(texto);
    });
    if (!encontrado) throw new Error("Selecciona un establecimiento válido de la lista o deja el campo vacío.");
    inputHidden.value = encontrado.codigo_eess;
    return { codigo: encontrado.codigo_eess, texto: encontrado.establecimiento_label };
}

function validarFechasAtenciones() {
    const inicio = document.getElementById("fechaInicio").value;
    const fin = document.getElementById("fechaFin").value;
    if (inicio && fin && inicio > fin) {
        throw new Error("La fecha de inicio no puede ser posterior a la fecha final.");
    }
}

function actualizarResumenAtenciones(data, servicioTexto, establecimientoTexto, granularidad) {
    const sumaPeriodos = data.reduce((suma, item) => suma + Number(item.total_atenciones || 0), 0);
    const total = data.length ? Number(data[0].total_filtrado ?? sumaPeriodos) : 0;
    const maximo = data.reduce((mayor, item) => Number(item.total_atenciones || 0) > Number(mayor.total_atenciones || 0) ? item : mayor, {});
    const promedio = data.length ? total / data.length : 0;
    const etiquetas = { mes: "Mensual", semana: "Semanal", dia: "Diaria" };

    document.getElementById("totalAtencionesFiltradas").textContent = formatoNumero(total);
    document.getElementById("totalPeriodosFiltrados").textContent = formatoNumero(data.length);
    document.getElementById("promedioAtencionesFiltradas").textContent = formatoNumero(Math.round(promedio));
    document.getElementById("maximoAtencionesFiltradas").textContent = formatoNumero(maximo.total_atenciones || 0);
    document.getElementById("periodoMaximoAtenciones").textContent = maximo.periodo ? `Periodo ${maximo.periodo}` : "Sin datos";
    document.getElementById("resumenFiltroAtenciones").textContent = `${servicioTexto} · ${establecimientoTexto} · ${etiquetas[granularidad]}`;
    document.getElementById("cantidadResultadosAtenciones").textContent = `${data.length} ${data.length === 1 ? "periodo" : "periodos"}`;

    const tbody = document.getElementById("tablaAtencionesFiltradas");
    tbody.innerHTML = "";
    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay datos para los filtros seleccionados.</td></tr>';
    }
    data.forEach(item => {
        const row = document.createElement("tr");
        const participacion = total ? `${(Number(item.total_atenciones || 0) * 100 / total).toLocaleString("es-PE", { maximumFractionDigits: 1 })}%` : "0%";
        [item.periodo, formatoNumero(item.total_atenciones), participacion].forEach((valor, index) => {
            const cell = document.createElement("td");
            if (index > 0) cell.className = "text-end";
            cell.textContent = valor;
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
    document.getElementById("totalTablaAtenciones").innerHTML = data.length ? `<tr class="fw-bold"><td>Total</td><td class="text-end">${formatoNumero(total)}</td><td class="text-end">100%</td></tr>` : "";
}

function establecerEstadoFiltro(mensaje, tipo = "normal") {
    const estado = document.getElementById("estadoFiltroAtenciones");
    estado.textContent = mensaje;
    estado.className = tipo === "error" ? "small text-danger" : tipo === "cargando" ? "small text-primary" : "small text-muted";
}

function configurarBuscador(idVisible, idOculto) {
    const input = document.getElementById(idVisible);
    input.addEventListener("focus", () => input.select());
    input.addEventListener("input", () => {
        if (!input.value.trim()) document.getElementById(idOculto).value = "TODOS";
    });
    input.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            input.value = "";
            document.getElementById(idOculto).value = "TODOS";
            input.blur();
        }
    });
}

async function crearGraficoServicioTiempo() {
    validarFechasAtenciones();
    const servicioSeleccionado = obtenerServicioSeleccionado();
    const establecimientoSeleccionado = obtenerEstablecimientoSeleccionado();

    const servicio = servicioSeleccionado.codigo;
    const servicioTexto = servicioSeleccionado.texto;

    const granularidad = document.getElementById("filtroGranularidad").value;
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;

    const params = new URLSearchParams();

    params.append("servicio", servicio);
    params.append("establecimiento", establecimientoSeleccionado.codigo);
    params.append("granularidad", granularidad);

    if (fechaInicio) {
        params.append("fecha_inicio", fechaInicio);
    }

    if (fechaFin) {
        params.append("fecha_fin", fechaFin);
    }

    const url = `/api/atenciones-servicio-tiempo?${params.toString()}`;

    const data = await obtenerDatos(url);

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

    actualizarResumenAtenciones(data, servicioTexto, establecimientoSeleccionado.texto, granularidad);
    establecerEstadoFiltro(`Consulta actualizada: ${data.length} ${data.length === 1 ? "periodo" : "periodos"}.`);
}

function descargarExcel(){
    let servicioSeleccionado;
    let establecimientoSeleccionado;
    try {
        validarFechasAtenciones();
        servicioSeleccionado = obtenerServicioSeleccionado();
        establecimientoSeleccionado = obtenerEstablecimientoSeleccionado();
    } catch (error) {
        establecerEstadoFiltro(error.message, "error");
        alert(error.message);
        return;
    }

    const params = new URLSearchParams();

    params.append(
        "servicio",
        servicioSeleccionado.codigo
    );
    params.append("establecimiento", establecimientoSeleccionado.codigo);

    params.append(
        "granularidad",
        document.getElementById("filtroGranularidad").value
    );


    params.append(
        "fecha_inicio",
        document.getElementById("fechaInicio").value
    );


    params.append(
        "fecha_fin",
        document.getElementById("fechaFin").value
    );


    window.location.href =
        "/api/exportar-atenciones-excel?" +
        params.toString();

}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        document.getElementById("fechaInicio").value = "2025-01-01";
        document.getElementById("fechaFin").value = "2025-12-31";
        configurarBuscador("buscadorServicio", "filtroServicio");
        configurarBuscador("buscadorEstablecimiento", "filtroEstablecimiento");

        await Promise.all([cargarListaServicios(), cargarListaEstablecimientos()]);
        await crearGraficoServicioTiempo();

        document.getElementById("btnAplicarFiltros").addEventListener("click", async event => {
            const boton = event.currentTarget;
            boton.disabled = true;
            establecerEstadoFiltro("Consultando datos…", "cargando");
            try {
                await crearGraficoServicioTiempo();
            } catch (error) {
                establecerEstadoFiltro(error.message, "error");
                alert(error.message);
            } finally {
                boton.disabled = false;
            }
        });

        document.getElementById("btnLimpiarFiltros").addEventListener("click", async () => {
            document.getElementById("buscadorServicio").value = "";
            document.getElementById("filtroServicio").value = "TODOS";
            document.getElementById("buscadorEstablecimiento").value = "";
            document.getElementById("filtroEstablecimiento").value = "TODOS";
            document.getElementById("filtroGranularidad").value = "mes";
            document.getElementById("fechaInicio").value = "2025-01-01";
            document.getElementById("fechaFin").value = "2025-12-31";
            establecerEstadoFiltro("Restableciendo consulta…", "cargando");
            try { await crearGraficoServicioTiempo(); } catch (error) { establecerEstadoFiltro(error.message, "error"); }
        });

        document.getElementById("btnDescargarExcel")
        .addEventListener("click", descargarExcel);

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
