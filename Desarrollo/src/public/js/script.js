document.addEventListener('DOMContentLoaded', function () {
  var filterSelect = document.getElementById('filter-select');
  var itemList = document.getElementsByClassName('item-list')[0];
  var items = Array.from(itemList.getElementsByTagName('li'));

  filterSelect.addEventListener('change', function (event) {
    var filterValue = event.target.value;

    items.forEach(function (item) {
      if (filterValue === 'todos' || item.classList.contains(filterValue)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });
});


function mostrarAlerta() {
  alert("¡Voto realizado con exito!");
}

function subirImagen() {
  var input = document.getElementById("imagen-input");
  var file = input.files[0];
  if (file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var image = new Image();
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}


function agregarCampo() {
  var campoContainer = document.getElementById('campo-container');
  var nuevoCampo = document.createElement('div');
  var forCarreras = '<% for(postulante of consejerosPostulantes) { %> <option value="<%= postulante.id %>"> <%= postulante.nombre %> </option> <% } %>';
  nuevoCampo.classList.add('campo');
  nuevoCampo.innerHTML = '<select id="select-carrera" class="select-carrera" name="carrera">' + forCarreras + ' </select>  <button class="eliminar-campo" onclick="eliminarCampo(this)">Eliminar</button>';
  campoContainer.appendChild(nuevoCampo);
}

function eliminarCampo(elemento) {
  var campo = elemento.parentNode;
  campo.parentNode.removeChild(campo);
}

//Funcion para bloquear fechas anteriores a la actual

var inputFecha = document.getElementById('start_date');
var fechaActual = new Date();

inputFecha.min = obtenerFechaActual();

inputFecha.addEventListener('input', function () {
  inputFecha.min = obtenerFechaActual();
});


function obtenerFechaActual() {
  var dia = fechaActual.getDate();
  var mes = fechaActual.getMonth() + 1;
  var anio = fechaActual.getFullYear();

  if (dia < 10) {
    dia = '0' + dia;
  }

  if (mes < 10) {
    mes = '0' + mes;
  }

  return anio + '-' + mes + '-' + dia;
}


var inputFecha = document.getElementById('end_date');
var fechaActual = new Date();

inputFecha.min = obtenerFechaActual();

inputFecha.addEventListener('input', function () {
  inputFecha.min = obtenerFechaActual();
});


function obtenerFechaActual() {
  var dia = fechaActual.getDate();
  var mes = fechaActual.getMonth() + 1;
  var anio = fechaActual.getFullYear();

  if (dia < 10) {
    dia = '0' + dia;
  }

  if (mes < 10) {
    mes = '0' + mes;
  }

  return anio + '-' + mes + '-' + dia;
}
