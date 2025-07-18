const whatsapp = '2235931151';
const urlAPI = 'https://script.google.com/macros/s/AKfycbxc2ftIG0__swK4ds3Oy9Q8UNym1Ysw73Km9HjA2EMZDqJmyzXVHz_Sn2GBA85DXHNMCg/exec?';
let turnos = [];
let reservados = [];

async function cargarTurnos() {
  const resp = await fetch(urlAPI + 'tipo=obtener');
  reservados = await resp.json();

  const fechas = generarFechas();
  let turnoNumero = 1;

  fechas.forEach(fecha => {
    const bloques = generarBloques(fecha);
    bloques.forEach(hora => {
      const diaTexto = formatoDia(fecha);
      const id = `T${turnoNumero}`;
      if (!reservados.includes(id)) {
        turnos.push({ nro: id, diaTexto, hora });
      }
      turnoNumero++;
    });
  });

  mostrarTurnos();
}

function generarFechas() {
  const hoy = new Date();
  const fechas = [];
  for (let i = 0; i < 14; i++) {
    const f = new Date(hoy);
    f.setDate(f.getDate() + i);
    if (f.getDay() !== 0) fechas.push(f);
  }
  return fechas;
}

function generarBloques(fecha) {
  const bloques = [];
  let inicio = fecha.getDay() === 6 ? 8 : 6;
  let fin = fecha.getDay() === 6 ? 16 : 20;
  for (let i = inicio; i < fin; i++) {
    bloques.push(`${i}:00`);
  }
  return bloques;
}

function formatoDia(fecha) {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado'];
  const diaSemana = dias[fecha.getDay()];
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const año = fecha.getFullYear();
  return `${diaSemana} - ${dia}/${mes}/${año}`;
}

function mostrarTurnos() {
  const contenedor = document.getElementById('turnos');
  contenedor.innerHTML = '';
  turnos.forEach(turno => {
    const div = document.createElement('div');
    div.className = 'turno';
    div.innerHTML = `
      <div><strong>${turno.diaTexto} - ${turno.hora}</strong></div>
      <button onclick="reservarTurno('${turno.nro}', '${turno.diaTexto}', '${turno.hora}')">Reservar turno</button>
    `;
    contenedor.appendChild(div);
  });
}

async function reservarTurno(nro, dia, hora) {
  const nombre = prompt("Ingresá tu nombre:");
  const celular = prompt("Ingresá tu número de celular:");
  if (!nombre || !celular) return alert("Debes completar tus datos para continuar.");

  const params = new URLSearchParams({
    tipo: 'guardar',
    nro, dia, hora, nombre, celular
  });

  await fetch(urlAPI + params.toString());
  document.getElementById("mensaje").style.display = "block";
  actualizarVista(nro);

  setTimeout(() => {
    const mensajeWp = `Ya reservé mi turno para el ${dia} a las ${hora}. Mi nombre es ${nombre}.`;
    window.location.href = `https://wa.me/54${whatsapp}?text=${encodeURIComponent(mensajeWp)}`;
  }, 1000);
}

function actualizarVista(nro) {
  const botones = document.querySelectorAll('button');
  botones.forEach(btn => {
    if (btn.parentElement.innerText.includes(nro)) {
      btn.parentElement.parentElement.remove();
    }
  });
}

window.onload = cargarTurnos;
