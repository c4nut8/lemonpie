function formatoNumero(valor) {
    return Number(valor || 0).toLocaleString("es-PE");
}

async function obtenerDatos(url) {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        throw new Error(data.error);
    }

    return data;
}

async function cargarCalidadDatos() {
    const data = await obtenerDatos("/api/calidad");

    document.getElementById("registros_sin_dni").textContent =
        formatoNumero(data.registros_sin_dni);

    document.getElementById("registros_sin_fecha_nacimiento").textContent =
        formatoNumero(data.registros_sin_fecha_nacimiento);

    document.getElementById("registros_sin_sexo").textContent =
        formatoNumero(data.registros_sin_sexo);

    document.getElementById("registros_sin_fua").textContent =
        formatoNumero(data.registros_sin_fua);

    return data;
}

function crearGraficoCalidadDatos(data) {
    new Chart(document.getElementById("chartCalidadDatos"), {
        type: "bar",
        data: {
            labels: [
                "Sin DNI",
                "Sin fecha nacimiento",
                "Sin sexo",
                "Sin FUA"
            ],
            datasets: [{
                label: "Registros",
                data: [
                    data.registros_sin_dni,
                    data.registros_sin_fecha_nacimiento,
                    data.registros_sin_sexo,
                    data.registros_sin_fua
                ],
                backgroundColor: [
                    "#d63939",
                    "#f59f00",
                    "#ae3ec9",
                    "#206bc4"
                ]
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

function cargarTablaCalidadDatos(data) {
    const tbody = document.getElementById("tablaCalidadDatos");

    const filas = [
        {
            problema: "Registros sin DNI",
            impacto: "Dificulta el cálculo de pacientes únicos y trazabilidad del paciente.",
            cantidad: data.registros_sin_dni
        },
        {
            problema: "Registros sin fecha de nacimiento",
            impacto: "Limita el análisis por edad y grupo etario.",
            cantidad: data.registros_sin_fecha_nacimiento
        },
        {
            problema: "Registros sin sexo",
            impacto: "Afecta la segmentación demográfica por sexo.",
            cantidad: data.registros_sin_sexo
        },
        {
            problema: "Registros sin FUA",
            impacto: "Impide relacionar correctamente la atención con la valorización SIS.",
            cantidad: data.registros_sin_fua
        }
    ];

    tbody.innerHTML = "";

    filas.forEach(fila => {
        tbody.innerHTML += `
            <tr>
                <td>${fila.problema}</td>
                <td>${fila.impacto}</td>
                <td class="text-end">${formatoNumero(fila.cantidad)}</td>
            </tr>
        `;
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const data = await cargarCalidadDatos();
        crearGraficoCalidadDatos(data);
        cargarTablaCalidadDatos(data);
    } catch (error) {
        console.error(error);
        alert("Error al cargar calidad de datos: " + error.message);
    }
});