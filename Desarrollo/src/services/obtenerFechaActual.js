// obtiene fecha actual del sistema
var fechaActual = new Date();

// obtiene dia, mes y año actual del sistema
var dia = fechaActual.getDate();
var mes = fechaActual.getMonth() + 1; // Los meses van de 0 a 11
var año = fechaActual.getFullYear();

// da formato a la fecha obtenida
var fechaActualSys = año + '/' + mes + '/' + dia;

console.log(fechaActualSys); 


module.exports = { fechaActualSys }